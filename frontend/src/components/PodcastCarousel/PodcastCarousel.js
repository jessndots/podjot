import React, { useEffect, useState } from "react";
import { Stack, Carousel } from "react-bootstrap";
import PodcastCarouselItem from "./PodcastCarouselItem"

function PodcastCarousel({ podcasts }) {
  const [groupedPods, setGroupedPods] = useState([])

  // divide the podcast list into groups for the carousel pages
  useEffect(() => {
    const arr = []
    const chunkSize = 2;
    for (let i = 0; i < podcasts.length; i += chunkSize) {
        const chunk = podcasts.slice(i, i + chunkSize);
        arr.push(chunk);
    }
    setGroupedPods(arr)
  }, [podcasts])

  // for each group, make carousel items
  const carouselItems = groupedPods.map(group => (
    <Carousel.Item key={group[0].title} >
      <Stack direction="horizontal" gap={3} className="d-flex justify-content-around align-items-stretch" >
        {group.map(pod => <PodcastCarouselItem key={pod.id} podcast={pod} />)}
      </Stack>
    </Carousel.Item>
  ))

  return <Carousel>
    {carouselItems}
  </Carousel>
}

export default PodcastCarousel