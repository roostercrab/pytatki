import React from "react";

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
    let updated_notes = this.props.notatki;
    let topic_notes_list = [];
    for (let value of updated_notes) {
      if (
        document.getElementById("subject").value ===
        value.substring(value.indexOf("/") + 1, value.indexOf("/", 1))
      ) {
        if (
          document.getElementById("topic").value ===
          value.substring(value.indexOf("/", 1) + 1, value.lastIndexOf("/"))
        ) {
          topic_notes_list.push(value.substring(value.lastIndexOf("/") + 1));
        }
      }
    }

    if (!topic_notes_list.includes(document.getElementById("note").value)) {
      updated_notes = [
        ...updated_notes,

        "/" +
          document.getElementById("subject").value +
          "/" +
          document.getElementById("topic").value +
          "/" +
          document.getElementById("note").value
      ];
    }
    e.preventDefault();
    this.props.update(updated_notes);
  };

  packTopicOptions = () => {
    let topic_options_temp = [];
    let topic_options = [];
    for (let temp_value of this.props.notatki) {
      if (
        topic_options_temp.indexOf(
          temp_value.substring(
            temp_value.indexOf("/", 1) + 1,
            temp_value.lastIndexOf("/")
          )
        ) < 0 &&
        document.getElementById("subject").value ==
          temp_value.substring(
            temp_value.indexOf("/") + 1,
            temp_value.indexOf("/", 1)
          )
      ) {
        topic_options_temp.push(
          temp_value.substring(
            temp_value.indexOf("/", 1) + 1,
            temp_value.lastIndexOf("/")
          )
        );
      }
    }
    for (let value of topic_options_temp) {
      topic_options.push(<option key={value}>{value}</option>);
    }
    topic_options.push(
      <option key="--Dodaj nowy dział--">--Dodaj nowy dział--</option>
    );
    if (this.state.current_topics !== topic_options) {
      this.setState({
        current_topics: topic_options
      });
    }
  };

  packSubjectOptions = () => {
    let subject_options_temp = [];
    let subject_options = [];
    for (let temp_value of this.props.notatki) {
      if (
        subject_options_temp.indexOf(
          temp_value.substring(
            temp_value.indexOf("/") + 1,
            temp_value.indexOf("/", 1)
          )
        ) < 0
      ) {
        subject_options_temp.push(
          temp_value.substring(
            temp_value.indexOf("/") + 1,
            temp_value.indexOf("/", 1)
          )
        );
      }
    }
    for (let value of subject_options_temp) {
      subject_options.push(<option key={value}>{value}</option>);
    }
    subject_options.push(
      <option key="--Dodaj nowy przedmiot--">--Dodaj nowy przedmiot--</option>
    );
    return subject_options;
  };

  componentDidMount() {
    this.packTopicOptions();
  }

  subjectChange = () => {
    this.packTopicOptions();
    if (
      document.getElementById("subject").value === "--Dodaj nowy przedmiot--"
    ) {
      this.setState({
        subject_input: true,
        topic_input: true
      });
    } else {
      this.setState({
        subject_input: false
      });
    }
    
  };

  topicChange = () => {
    if (document.getElementById("topic").value === "--Dodaj nowy dział--") {
      this.setState({
        topic_input: true
      });
    } else {
      this.setState({
        topic_input: false
      });
    }
  };

  newSubjectInput = () => {
    if (this.state.subject_input) {
      return <input type="text" name="new-subject" />;
    }
  };

  newTopicInput = () => {
    if (this.state.topic_input) {
      return <input type="text" name="new-topic" />;
    }
  };

  render() {
    return (
      <div style={{marginTop: "100px"}}>
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
          Nazwa notatki <input type="text" id="note" />
          <input type="submit" value="Dodaj notatkę" />
        </form>
      </div>
    );
  }
}

export default AddNote;
