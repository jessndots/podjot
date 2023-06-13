import React, { useContext, useState, useEffect } from "react";
import UserContext from "../../userContext";
import { Card, Button, Offcanvas, Form } from "react-bootstrap";
import StarRatings from "react-star-ratings";
import podjotApi from "../../api/podjotApi"
 

function ActionCard({ media, type }) {
  const { user } = useContext(UserContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
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
        console.log(save)
        if (save.rating) setRating(save.rating);
        if (save.notes) setNotes(save.notes);
        if (save.favorite) setIsFavorite(save.favorite);
        setIsSaved(true)
      } catch(err) {
        setIsSaved(false)
      }
    }
    if (user.username && media.id) fetchNotes();
  }, [user, media, type])

  // save podcast/episode with rating, favorite, and notes
  async function save(r, n, f) {
    try {
      if (type === 'podcast') {
        const data = {username: user.username, podcastId: media.id, rating: r, notes: n, favorite: f}
        if (isSaved) {
          await podjotApi.editSavedPodcast(data)
        } else {
          await podjotApi.savePodcast(data)
        }
      } 
      if (type === 'episode') {
        const data = {username: user.username, episodeId: media.id, rating: r, notes: n, favorite: f}
        if (isSaved) {
          await podjotApi.editSavedEpisode(data)
        } else {
          await podjotApi.saveEpisode(data)
        }
      }
      setIsSaved(true);
    } catch(err) {
      console.error('err in save func', err);
    }
  }

  // rate podcast, initiate save
  const rate = (newRating) => {
    setRating(newRating);
    save(newRating, notes, isFavorite);
  }

  // favorite / unfavorite, initiate save
  const favorite = () => {
    setIsFavorite(!isFavorite);
    save(rating, notes, !isFavorite)
  }

  // show the notes
  const handleShow = () => setShowNotes(true);

  // close the notes and initiate save
  const handleClose = () => {
    setShowNotes(false);
    save(rating, notes, isFavorite);
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
            {isFavorite? (
              <Button onClick={favorite}><i className="bi bi-star-fill"></i> Favorite</Button>
            ): (
              <Button onClick={favorite}><i className="bi bi-star"></i> Favorite</Button>
            )}
            {notes? (
              <><Button onClick={handleShow}><i className="bi bi-pencil-square"></i> Edit Notes</Button><br /></>
            ): (
              <><Button onClick={handleShow}><i className="bi bi-pencil-square"></i> Take Notes</Button><br /></>
            )}
            <Card.Subtitle>Rate</Card.Subtitle>
            <StarRatings
              rating={rating}
              numberOfStars={5}
              changeRating={rate}
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
            <Form.Control onChange={handleChange} as="textarea" rows={15} placeholder="Jot down your thoughts..." value={notes} />
            <br/><Button onClick={handleClose}>Save & Close</Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    ) : null}
  </div>
}

export default ActionCard