import React, { useContext, useEffect, useState } from "react";
import { Container, Stack, Carousel, CardGroup } from "react-bootstrap";
import UserContext from "../userContext";
import PodcastCarouselItem from "../Podcast/PodcastCarouselItem"

function PodcastCarousel({ podcasts }) {
  const { user } = useContext(UserContext);
  const [groupedPods, setGroupedPods] = useState([])

  useEffect(() => {
    const arr = []
    const chunkSize = 2;
    for (let i = 0; i < podcasts.length; i += chunkSize) {
        const chunk = podcasts.slice(i, i + chunkSize);
        arr.push(chunk);
    }
    setGroupedPods(arr)
  }, [podcasts])

  const carouselItems = groupedPods.map(group => (
    <Carousel.Item key={group[0].title} >
      <Stack direction="horizontal" gap={3} className="d-flex justify-content-between align-items-stretch" >
        {group.map(pod => <PodcastCarouselItem key={pod.id} podcast={pod} />)}
      </Stack>
    </Carousel.Item>
  ))

  return <Carousel>
    {carouselItems}
  </Carousel>
}

export default PodcastCarousel