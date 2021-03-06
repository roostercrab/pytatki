from flask_graphql import GraphQLView
from pytatki.main import APP, CONFIG
from pytatki.api.graphql.functions import api_create_usergroup, api_create_notegroup
from pytatki.security import ts
from pytatki.dbconnect import connection, has_access_to_usergroup, get_note, get_last_note_actions, get_notegroup, get_root_id,  get_usergroups_of_user, get_users_of_usergroup
import gc
from flask_login import current_user
from pytatki.views import find_notegroup_children, post_note, add_tag_to_note
from graphql.type.definition import GraphQLArgument, GraphQLField, GraphQLObjectType
from graphql.type.scalars import GraphQLString, GraphQLInt
from graphql.type.schema import GraphQLSchema
from itsdangerous import TimedJSONWebSignatureSerializer, BadSignature, SignatureExpired
from pymysql import escape_string


def generate_access_token(id_user, expiration=3600):
    s = TimedJSONWebSignatureSerializer(APP.secret_key, expires_in=expiration)
    return s.dumps({'id': id_user})


def verify_auth_token(token):
    s = TimedJSONWebSignatureSerializer(APP.secret_key)
    try:
        data = s.loads(token)
    except SignatureExpired:
        return None
    except BadSignature:
        return None
    return data


def invite(iduser, idusergroup):
    if has_access_to_usergroup(idusergroup, iduser):
        token = ts.dumps(idusergroup, salt=APP.secret_key)
        return "{}/join/{}".format(CONFIG['host'], token)
    return "perimission denied"


def auth(func, token):
    def some_func(*args, **kwargs):
        return func(*args, **kwargs) if verify_auth_token(token) else "Invalid or expired access_token"
    return some_func


def resolve_raises(*_):
    raise Exception("Throws!")


def executeSQL(query, *args, **kwargs):
    con, conn = connection()
    con.execute(query, *args, **kwargs)
    result = con.fetchone()
    con.close()
    conn.close()
    gc.collect()
    return result


QueryRootType = GraphQLObjectType(
    name='QueryRoot',
    fields={
        'getUser': GraphQLField(
            type=GraphQLString,
            args={
                'ident': GraphQLArgument(GraphQLInt)
            },
            resolver=lambda obj, info, ident: executeSQL(
                "SELECT * FROM user WHERE iduser = %s", escape_string(str(ident)))
        ),
        'getNoteByParentId': GraphQLField(
            type=GraphQLString,
            args={
                'parent_id': GraphQLArgument(GraphQLInt)
            },
            resolver=lambda obj, info, parent_id: executeSQL(
                "SELECT title FROM note_view WHERE parent_id = %s", escape_string(str(parent_id)))
        ),
        'getNotegroupById': GraphQLField(
            type=GraphQLString,
            args={
                'notegroup_id': GraphQLArgument(GraphQLInt),
                'access_token': GraphQLArgument(GraphQLString)
            },
            resolver=lambda obj, info, notegroup_id, access_token: get_notegroup(
                notegroup_id, verify_auth_token(access_token)['id']) if verify_auth_token(access_token) else "invalid or expired access_token"
        ),
        'getContent': GraphQLField(
            type=GraphQLString,
            args={
                'id_notegroup': GraphQLArgument(GraphQLInt),
                'access_token': GraphQLArgument(GraphQLString)
            },
            resolver=lambda obj, info, id_notegroup, access_token: find_notegroup_children(
                id_notegroup, verify_auth_token(access_token)['id']) if verify_auth_token(access_token) else "invalid or expired access_token"
        ),
        'getNoteById': GraphQLField(
            type=GraphQLString,
            args={
                'id_note': GraphQLArgument(GraphQLInt),
                'access_token': GraphQLArgument(GraphQLString)
            },
            resolver=lambda obj, info, id_note, access_token: get_note(
                id_note, verify_auth_token(access_token)['id']) if verify_auth_token(access_token) else "invalid or expired access_token"
        ),
        'getNoteLastActions': GraphQLField(
            type=GraphQLString,
            args={
                'id_note': GraphQLArgument(GraphQLInt),
                'access_token': GraphQLArgument(GraphQLString)
            },
            resolver=lambda obj, info, id_note, access_token: get_last_note_actions(
                id_note, verify_auth_token(access_token)['id']) if verify_auth_token(access_token) else "invalid or expired access_token"
        ),
        'getRootId': GraphQLField(
            type=GraphQLString,
            args={
                'id_usergroup': GraphQLArgument(GraphQLInt),
                'access_token': GraphQLArgument(GraphQLString)
            },
            resolver=lambda obj, info, id_usergroup, access_token: get_root_id(
                id_usergroup, verify_auth_token(access_token)['id']) if verify_auth_token(access_token) else "invalid or expired access_token"
        ),
        'getUsergroups': GraphQLField(
            type=GraphQLString,
            args={
                'access_token': GraphQLArgument(GraphQLString)
            },
            resolver=lambda obj, info, access_token: get_usergroups_of_user(verify_auth_token(
                access_token)['id']) if verify_auth_token(access_token) else "invalid or expired access_token"
        ),
        'generateInvitationLink': GraphQLField(
            type=GraphQLString,
            args={
                'id_usergroup': GraphQLArgument(GraphQLInt),
                'access_token': GraphQLArgument(GraphQLString)
            },
            resolver=lambda obj, info, id_usergroup, access_token: invite(
                verify_auth_token(access_token)['id'], id_usergroup) if verify_auth_token(access_token) else "invalid or expired access_token"
        ),
        'getMembers': GraphQLField(
            type=GraphQLString,
            args={
                'id_usergroup': GraphQLArgument(GraphQLInt),
                'access_token': GraphQLArgument(GraphQLString)
            },
            resolver=lambda obj, info, id_usergroup, access_token: get_users_of_usergroup(
                id_usergroup, verify_auth_token(access_token)['id']) if verify_auth_token(access_token) else "invalid or expired access_token"
        ),
        'getToken': GraphQLField(
            type=GraphQLString,
            resolver=lambda obj, info: generate_access_token(current_user['iduser']).decode(
                'ascii') if current_user.is_authenticated else "You need to authenticate this app"
        ),
        'checkToken': GraphQLField(
            type=GraphQLString,
            args={'access_token': GraphQLArgument(GraphQLString)},
            resolver=lambda obj, info, access_token: verify_auth_token(
                access_token)
        )
    }
)

MutationRootType = GraphQLObjectType(
    name='MutationRoot',
    fields={
        'writeTest': GraphQLField(
            type=QueryRootType,
            resolver=lambda *_: QueryRootType
        ),
        'post_note': GraphQLField(
            type=GraphQLString,
            args={
                'title': GraphQLArgument(GraphQLString),
                'type': GraphQLArgument(GraphQLString),
                'value': GraphQLArgument(GraphQLString),
                'destination_folder_id': GraphQLArgument(GraphQLInt),
                'access_token': GraphQLArgument(GraphQLString)
            },
            resolver=lambda obj, info, title, type, value, destination_folder_id, access_token: post_note(
                title, type, value, destination_folder_id, verify_auth_token(access_token)['id']) if verify_auth_token(access_token) else "invalid or expired access_token"
        ),
        'addTagToNote': GraphQLField(
            type=GraphQLString,
            args={
                'tag': GraphQLArgument(GraphQLString),
                'note_id': GraphQLArgument(GraphQLInt),
                'access_token': GraphQLArgument(GraphQLString)
            },
            resolver=lambda obj, info, tag, note_id, access_token: add_tag_to_note(
                tag, note_id, verify_auth_token(access_token)['id']) if verify_auth_token(access_token) else "invalid or expired access_token"
        ),
        'createUsergroup': GraphQLField(
            type=GraphQLString,
            args={
                'name': GraphQLArgument(GraphQLString),
                'description': GraphQLArgument(GraphQLString),
                'access_token': GraphQLArgument(GraphQLString)
            },
            resolver=lambda obj, info, name, description, access_token: api_create_usergroup(
                name, description, verify_auth_token(access_token)['id']) if verify_auth_token(access_token) else "invalid or expired access_token"
        ),
        'createNotegroup': GraphQLField(
            type=GraphQLString,
            args={
                'name': GraphQLArgument(GraphQLString),
                'id_usergroup': GraphQLArgument(GraphQLInt),
                'parent_id': GraphQLArgument(GraphQLInt),
                'access_token': GraphQLArgument(GraphQLString)
            },
            resolver=lambda obj, info, name, id_usergroup, parent_id, access_token: api_create_notegroup(
                name, id_usergroup, parent_id, verify_auth_token(access_token)['id']) if verify_auth_token(access_token) else "invalid or expired access_token"
        )
    }
)

schema = GraphQLSchema(QueryRootType, MutationRootType)

APP.add_url_rule('/api/', view_func=GraphQLView.as_view('api', schema=schema))
APP.add_url_rule(
    '/graphiql/', view_func=GraphQLView.as_view('graphiql', schema=schema, graphiql=True))
