import React, { useContext, useState, useEffect } from "react";
import UserContext from "../../userContext";
import { Card, Button, Offcanvas, Form } from "react-bootstrap";
import StarRatings from "react-star-ratings";
import podjotApi from "../../api/podjotApi"
 

function ActionCard({ media, type }) {
  const { user } = useContext(UserContext);
  const [isSaved, setIsSaved] = useState(false)
  const [showNotes, setShowNotes] = useState(false);
  const [rating, setRating] = useState();
  const [notes, setNotes] = useState()


  // fetch user data on the saved podcast/episode
  useEffect(() => {
    async function fetchNotes() {
      try {
        let save
        if (type === 'podcast') {
          save = await podjotApi.getSavedPodcast(media.id);
        }
        if (type === 'episode') {
          save = await podjotApi.getSavedEpisode(media.id)
        }
        if (save.rating) setRating(save.rating);
        if (save.notes) setNotes(save.notes);
        setIsSaved(true);
      } catch(err) {
        setIsSaved(false)
      }
    }
    if (user.username) fetchNotes();
  }, [user, media, type])

  // save podcast/episode with rating and notes
  async function save(r, n) {
    try {
      const data = {username: user.username, podcastId: media.id, rating: r, notes: n}
      if (type === 'podcast'){
        if (isSaved) {
          await podjotApi.editSavedPodcast(data)
        } else {
          await podjotApi.savePodcast(data)
        }
      }
      if (type === 'episode') {
        if (isSaved) {
          await podjotApi.editSavedEpisode(data)
        } else {
          await podjotApi.saveEpisode(data)
        }
      }
      setIsSaved(true);

    } catch(err) {
      console.error(err);
    }
  }

  // rate podcast, initiate save
  const ratePodcast = (newRating) => {
    setRating(newRating);
    save(newRating, notes);
  }

  // show the notes
  const handleShow = () => setShowNotes(true);

  // close the notes and initiate save
  const handleClose = () => {
    setShowNotes(false);
    save(rating, notes);
  }

  const handleChange = (evt) => {
    const { value } = evt.target;
    setNotes(value);
  }

  return <div>
    <Card>
      {user.username ? (
        <Card.Body>
          <div className="d-grid gap-2">
            {isSaved? (
              <Button><i className="bi bi-bookmark-fill"></i> Saved</Button>
            ): (
              <Button onClick={save}><i className="bi bi-bookmark"></i> Save</Button>
            )}
            <Button onClick={handleShow}><i className="bi bi-pencil-square"></i> Take Notes</Button><br />
            <Card.Subtitle>Rate</Card.Subtitle>
            <StarRatings
              rating={rating}
              numberOfStars={5}
              changeRating={ratePodcast}
              name="podRating"
              starDimension="20px"
              starSpacing="5px"
              starRatedColor="red"
              starHoverColor="red"
              starEmptyColor="gray"
            />
          </div>
        </Card.Body>

      ) : (
        <Card.Body>
          <Card.Subtitle>Log in or create an account to save, rate, and keep notes for this podcast!</Card.Subtitle>
          <br />
          <Button href="/login">Log In</Button> <br /><br />
          <Button href="/signup">Sign Up</Button>
        </Card.Body>
      )}
    </Card>
    {user.username ? (
      <Offcanvas show={showNotes} onHide={handleClose} placement='end'>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Notes on {media.title}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form>
            <Form.Control onChange={handleChange} as="textarea" rows={20} placeholder="Jot down your thoughts..." value={notes} />
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    ) : null}
  </div>
}

export default ActionCard