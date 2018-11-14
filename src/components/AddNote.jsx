import React from "react";
import style from "../scss/AddContent.scss";
import Modal from "./Modal.jsx";

const AddNote = props => {
  let uploadNote = e => {
    e.preventDefault();
    const form = document.getElementById("form");
    const file = form[1].files[0];
    const title = form[0].value;
    var formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append(
      "notegroup_id",
      props.that.state.currentDirId[props.that.state.currentDepth]
    );
    fetch(props.that.state.siteUrl + "/add/", {
      method: "POST",
      body: formData
    })
      .then(
        response => response.json() // if the response is a JSON object
      )
      .then(
        success => alert(success.data) // Handle the success response object
      )
      .catch(
        error => console.log(error) // Handle the error response object
      );
    props.that.updateContent();
    e.target.querySelector("input").value = null;
  };

  return (
    <div>
      <Modal name="Dodaj notatkę">
        <h5>Dodaj notatkę w aktualnym folderze</h5>
        <div>
          <form id="form" className={style.form} onSubmit={uploadNote}>
            <label htmlFor="noteTitle">Tytuł notatki</label>
            <br />
            <input required type="text" name="title" id="noteTitle" />
            <br />
            <label htmlFor="noteFile">Plik notatki</label>
            <br />
            <input required type="file" name="file" id="noteFile" />
            <br />
            <input type="submit" value="Dodaj" />
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(AddNote);
