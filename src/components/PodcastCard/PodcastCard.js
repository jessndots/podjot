import React from "react";
import { Card } from "react-bootstrap";
import parse from 'html-react-parser';
import './PodcastCard.css'

function PodcastCard({ podcast }) {
  // format time as year
  const getYear = function (milliseconds) {
    const d = new Date(milliseconds);
    return d.getFullYear(); ;
  }

  // removes all but the first p element for the truncated description
  const parseAndTruncate = (d) => {
    let count = 0
    return parse(d, {
      replace: domNode => {
        // if not first text node, return fragment
        if (count === 1) return <></>

        // find node with start of text
        let textNode
        if (domNode.type === 'text') {
          if (!domNode.data.trim()) return <></>
          textNode = domNode         
        } else if (!!domNode.children) {
          for (let i=0; i < domNode.children.length; i++) {
            const n = domNode.children[i]
            if (domNode.children[i].type === 'text') {
              // make sure text is not just an empty string
              if (!n.data.trim() || n.data.trim() === '' || n.data.trim() === null) {
                continue
              } else {
                  textNode = domNode.children[i]
              }
            }
          }
        } else {
          return <></>
        }
        // increase count now that we have the first text node and return node
        count++
        return <p>{textNode.data}</p>
      }
    });
  }

  return <div><Card className="border border-dark">
  <Card.Body>
      <div className="d-flex justify-content-between">
        <div className="flex-grow-1">
          <Card.Title className="mb-3">{parse(podcast.title_highlighted) || podcast.title || podcast.title_original}</Card.Title>
          <Card.Subtitle className="mb-4" >By {podcast.publisher || podcast.publisher_original}</Card.Subtitle>
          <Card.Subtitle className="fw-light">{getYear(podcast.earliest_pub_date_ms || podcast.pub_date_ms)}</Card.Subtitle>
        </div>
        <img src={podcast.thumbnail} alt="Podcast thumbnail" style={{width:"150px", height:"150px"}} />
      </div>

      <br />
      <div className="line-clamp">{parseAndTruncate(podcast.description || podcast.description_original)}</div>
      <a href={`/podcasts/${podcast.id}`} className="stretched-link"></a>
  </Card.Body>
</Card><br /></div>
}

export default PodcastCard