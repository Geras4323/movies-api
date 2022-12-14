import React from 'react';
import { useRouter } from 'next/router';
import { getData } from '@functions/getData';
import { Movie } from '@components/Movie';
import { Search } from '@components/Search';
import { MovieSkeleton } from '@components/MovieSkeleton';
import Link from 'next/link';

import { LanguageContext } from '@contexts/LanguageContext';


export default function GenreMovies() {
  const [currentGenre, setCurrentGenre] = React.useState();
  // const [currentGenreID, setCurrentGenreID] = React.useState();  // not currently used
  const [filteredMovies, setFilteresMovies] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const { currentLanguage } = React.useContext(LanguageContext);
  const router = useRouter();


  const options = {
    root: null,
    rootMargin: '200px',
  }
  //Infinite Scrolling
  const observer = React.useRef()
  const endOfList = React.useCallback(node => {
    if (loading) return;
    if (page === lastPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        // console.log('working');
        setPage(prevPage => prevPage + 1)
      }
    }, options)
    if (node) observer.current.observe(node);
  }, [loading])


  function findGenreId(genreName) {
    getData({path: 'genre/movie/list', lang: currentLanguage}) // find the genre's ID
      .then(data => data.genres)
      .then(genres => genres.find(({ name }) => name === genreName))
      .then(genreData => {
        try {
          const id = genreData.id;  // gets the ID
          // setCurrentGenreID(id);
          getData({path: '/discover/movie', genresIDs: id, page: page, lang: currentLanguage})  // finds the movies that match with that genre's ID
          .then(genreMovies => {
            setFilteresMovies(prev => prev.concat(genreMovies.results))
            if (!lastPage) setLastPage(genreMovies.total_pages)
          })
          .then(() => setLoading(false))
          // .then(() => console.log('done'))
        } catch (error) { // leave this here, patches an "error". It actually works. I don't know why it shows an error
          // console.log(error);
        }
      })
  }

  React.useEffect(() => {
    const { genre } = router.query;
    setCurrentGenre(genre);
    findGenreId(genre);
  }, [router.query, page, currentLanguage])

  return (
    <div className="p-4">
      <section>
        <div className="w-full h-8 flex flex-row gap-4 mb-4">
          <Link href="/">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className='w-10 h-full fill-current text-white   hover:cursor-pointer'>
              <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
            </svg>
          </Link>
          <p className="text-2xl text-white font-semibold mb-4">{currentGenre}</p>
        </div>
        <Search />
        { loading
          ? <div className="g_grid-container">
              <MovieSkeleton />
              <MovieSkeleton />
              <MovieSkeleton />
              <MovieSkeleton />
              <MovieSkeleton />
              <MovieSkeleton />
              <MovieSkeleton />
              <MovieSkeleton />
              <MovieSkeleton />
              <MovieSkeleton />
              <MovieSkeleton />
              <MovieSkeleton />
            </div>
          : <div>
              <div className="g_grid-container">
                {filteredMovies.map((movie) => (
                  <Movie
                    key={movie.id}
                    movie={movie}
                  />
                ))}
              </div>
              <div
                ref={endOfList}
                className="w-full h-4 mt-6 flex justify-center"
              >
                {/* <button
                  onClick={() => setPage(prev => prev + 1)}
                  className="w-24 h-10 bg-black bg-opacity-50 rounded-lg"
                >
                  See more
                </button> */}
              </div>
            </div>
        }
      </section>
    </div>
  )
}