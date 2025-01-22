import React from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { Paper } from "@mui/material";
import styled from "@emotion/styled";
import { spacing } from "@mui/system";

// Images pour le carrousel (vous pouvez remplacer par les vôtres)
import image1 from "/static/img/illustrations/image1.png";
import image2 from "/static/img/illustrations/image2.png";
import image3 from "/static/img/illustrations/image3.png";

const WelcomeMessage = styled(Typography)(spacing);
const CarouselItem = styled(Paper)`
  position: relative;
  background-size: cover;
  background-position: center;
  height: 400px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  &:before {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }
`;

function Item(props) {
  return (
    <CarouselItem style={{ backgroundImage: `url(${props.item.image})` }}>
      <Box position="relative">
        <Typography variant="h4">{props.item.title}</Typography>
        <Typography variant="subtitle1">{props.item.description}</Typography>
        {props.item.buttonText && (
          <Button variant="contained" color="primary" href={props.item.buttonLink}>
            {props.item.buttonText}
          </Button>
        )}
      </Box>
    </CarouselItem>
  );
}

function Acceuil() {
  const items = [
    {
      image: image1,
      title: "Bienvenue à Rayon Vert",
      description: "Votre point de référence pour l'innovation et la croissance.",
      buttonText: "En savoir plus",
      buttonLink: "#"
    },
    {
      image: image2,
      title: "Notre Équipe",
      description: "Rencontrez les esprits brillants derrière notre succès.",
      buttonText: "Voir l'équipe",
      buttonLink: "#"
    },
    {
      image: image3,
      title: "Projets",
      description: "Découvrez nos projets récents et nos futures innovations.",
      buttonText: "Voir les projets",
      buttonLink: "#"
    }
  ];

  return (
    <Container>
      <WelcomeMessage variant="h2" align="center" mt={5} mb={3}>
        Bienvenue aux employés de Rayon Vert
      </WelcomeMessage>
      <Carousel>
        {items.map((item, i) => (
          <Item key={i} item={item} />
        ))}
      </Carousel>
    </Container>
  );
}

export default Acceuil;
