import React from "react";

var new_topic_message = "--Dodaj nowy dział--";
var new_subject_message = "--Dodaj nowy przedmiot--";

class AddNote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current_topics: [],
      subject_input: false,
      topic_input: false
    };
  }

  handleSubmit = e => {
    e.preventDefault();
    let updated_notes = this.props.notatki;
    let topic_notes_list = [];
    for (let value of updated_notes) {
      if (value != null) {      
        if (document.getElementById("subject").value === value.substring(value.indexOf("/") + 1, value.indexOf("/", 1))) {
          if (document.getElementById("topic").value === value.substring(value.indexOf("/", 1) + 1, value.lastIndexOf("/"))) {
            topic_notes_list.push(value.substring(value.lastIndexOf("/") + 1));
          }
        }
      }
    }

    if (!topic_notes_list.includes(document.getElementById("note").value)) {
      var new_note = "/"
      if (document.getElementById("subject").value === new_subject_message &&
        document.getElementById("new-subject").value != "" &&
        document.getElementById("new-topic").value != "") {

        new_note += document.getElementById("new-subject").value + "/" + document.getElementById("new-topic").value + "/" + document.getElementById("note").value;
      } else if (document.getElementById("topic").value === new_topic_message && document.getElementById("new-topic") != null) {
        new_note += document.getElementById("subject").value + "/" + document.getElementById("new-topic").value + "/" + document.getElementById("note").value;
      } else if (document.getElementById("topic").value === new_topic_message && document.getElementById("new-topic") == null || document.getElementById("subject").value === new_subject_message && document.getElementById("new-subject") == null) {
        // handle no input
        return 0;
      } else {
        new_note += document.getElementById("subject").value + "/" + document.getElementById("topic").value + "/" + document.getElementById("note").value;
      }
      updated_notes = [
        ...updated_notes,
        new_note
      ];
      document.getElementById("note").value = "";
    }
    this.props.update(updated_notes);
  };

  packTopicOptions = () => {
    if (this.props.topics){
      let topic_options = [];   
      for (let value of this.props.topics) {
        topic_options.push(<option key={value}>{value}</option>);
      }
      topic_options.push(<option key={new_topic_message}>{new_topic_message}</option>);
      if (this.state.current_topics !== topic_options) {
        this.setState({ current_topics: topic_options });
      }
    }
  };

  packSubjectOptions = () => {
    if(this.props.subjects){

      let subject_options = [];
      for (let value of this.props.subjects) {
        subject_options.push(<option key={value}>{value}</option>);
      }
      subject_options.push(<option key={new_subject_message}>{new_subject_message}</option>);
      return subject_options;
    }
    return 0;
  };

  componentDidMount() {
    this.packTopicOptions();
  }

  subjectChange = () => {
    this.packTopicOptions();
    if (document.getElementById("subject").value === new_subject_message) {
      this.setState({ subject_input: true, topic_input: true });
    } else {
      this.setState({ subject_input: false, topic_input: true });
    }

  };

  topicChange = () => {
    if (document.getElementById("topic").value === new_topic_message) {
      this.setState({ topic_input: true });
    } else {
      this.setState({ topic_input: false });
    }
  };

  newSubjectInput = () => {
    if (this.state.subject_input) {
      return <input type="text" id="new-subject" />;
    }
  };

  newTopicInput = () => {
    if (this.state.topic_input) {
      return <input type="text" id="new-topic" />;
    }
  };

  render() {
    return (<div style={{
      marginTop: "100px"
    }}>
      <form onSubmit={this.handleSubmit}>
        Przedmiot
        <select id="subject" onChange={this.subjectChange}>
          {this.packSubjectOptions()}
        </select>
        {this.newSubjectInput()}
        Dział
        <select id="topic" onChange={this.topicChange}>
          {this.state.current_topics}
        </select>
        {this.newTopicInput()}
        Nazwa notatki
        <input type="text" id="note" />
        Dodaj plik
        <input type="file" required="required" />
        <input type="submit" value="Dodaj notatkę" />
      </form>
    </div>);
  }
}

export default AddNote;