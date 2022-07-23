import { motion, AnimatePresence, useViewportScroll } from "framer-motion";
import { useState } from "react";
import { useQuery } from "react-query";
import styled from "styled-components";
import { getMovies, IMovieResult } from "../api";
import { makeImagePath } from "../utils";
import { Navigate, PathMatch, useMatch, useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  background-color: dark;
  position: relative;
`;
const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Banner = styled.div<{ bgPhoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
`;
const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px;
  font-weight: 400;
`;
const Overview = styled.p`
  font-size: 28px;
  width: 50%;
`;
const Slider = styled.div`
  position: relative;
  top: -100px;
`;
const Row = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
  margin-bottom: 5px;
  position: absolute;
  width: 100%;
`;
const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  height: 18vh;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
  cursor: pointer;
`;
const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 16px;
  }
`;
const BigBox = styled(motion.div)`
  width: 40vw;
  height: 80vh;
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;
const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 400px;
  display: flex;
  align-items: flex-end;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 46px;
`;

const BigOverview = styled.p`
  padding: 30px 20px;
  color: ${(props) => props.theme.white.lighter};
  line-height: 1.4;
`;
const rowVar = {
  initial: { x: window.innerWidth + 5 },
  animate: { x: 0 },
  exit: { x: -window.innerWidth - 5 },
};
const boxVar = {
  initial: { scale: 1 },
  hover: {
    scale: 1.3,
    y: -40,
    transition: { delay: 0.5, duration: 0.3 },
  },
};
const infoVar = {
  hover: { opacity: 1, transition: { delay: 0.5, duration: 0.3 } },
};

let offset = 6;
function Home() {
  const { data, isLoading } = useQuery<IMovieResult>(
    ["movies,nowPlaying"],
    getMovies
  );
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const { scrollY } = useViewportScroll();
  const history = useNavigate();
  const bigMovieMatch: PathMatch<string> | null = useMatch("/movies/:id");
  const clickedMovie =
    bigMovieMatch?.params.id &&
    data?.results.find(
      (movie) => String(movie.id) === bigMovieMatch?.params.id
    );
  console.log(clickedMovie);

  const increaseIndex = () => {
    if (data) {
      if (leaving) return;
      toggleLeaving();
      const moviesLength = data?.results.length - 1;
      const maxIndex = Math.floor(moviesLength / offset);
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const onBoxClicked = (movieId: number) => {
    history(`/movies/${movieId}`);
  };
  const onClickOverlay = () => history("/");
  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            onClick={increaseIndex}
            bgPhoto={makeImagePath(data?.results[0].backdrop_path || "")}
          >
            <Title>{data?.results[0].title}</Title>
            <Overview>{data?.results[0].overview}</Overview>
          </Banner>
          <Slider>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Row
                variants={rowVar}
                transition={{ type: "tween", duration: 1 }}
                initial="initial"
                animate="animate"
                exit="exit"
                key={index}
              >
                {data?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      key={movie.id}
                      bgPhoto={makeImagePath(movie.backdrop_path || "")}
                      layoutId={movie.id + ""}
                      variants={boxVar}
                      whileHover="hover"
                      initial="initial"
                      transition={{ type: "tween" }}
                      onClick={() => onBoxClicked(movie.id)}
                    >
                      <Info variants={infoVar}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onClickOverlay}
                  animate={{
                    opacity: 1,
                    transition: { delay: 0, duration: 0.3 },
                  }}
                />
                <BigBox
                  layoutId={bigMovieMatch.params.id}
                  style={{ top: scrollY.get() + 100 }}
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                            clickedMovie.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      >
                        <BigTitle>{clickedMovie.title}</BigTitle>
                      </BigCover>
                      <BigOverview>{clickedMovie.overview}</BigOverview>
                    </>
                  )}
                </BigBox>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}
export default Home;
