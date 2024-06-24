import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Papa from 'papaparse';
import moviesCSV from '../movie.csv';
import watchaLogo from '../watcha.png';
import netflixLogo from '../netflix.png';
import disneyPlusLogo from '../disneyplus.png';
import wavveLogo from '../wavve.png';
import detailLogoImage from '../logo.png';
import Popcho from '../pages/Popcho';
import '../css/MvdetailPage.css';

const flatrateLogos = {
  'disney plus': disneyPlusLogo,
  'netflix': netflixLogo,
  'watcha': watchaLogo,
  'wavve': wavveLogo,
};

const flatrateUrls = {
  'disney plus': 'https://www.disneyplus.com',
  'netflix': 'https://www.netflix.com',
  'watcha': 'https://www.watcha.com',
  'wavve': 'https://www.wavve.com',
};

const flatrateNames = {
  'disney plus': '디즈니 플러스',
  'netflix': '넷플릭스',
  'watcha': '왓챠',
  'wavve': '웨이브',
};

const genreMapping = {
  '28': '액션',
  '12': '모험',
  '16': '애니메이션',
  '35': '코미디',
  '80': '범죄',
  '99': '다큐멘터리',
  '18': '드라마',
  '10751': '가족',
  '14': '판타지',
  '36': '역사',
  '27': '공포',
  '10402': '음악',
  '9648': '미스터리',
  '10749': '로맨스',
  '878': 'SF',
  '10770': 'TV 영화',
  '53': '스릴러',
  '10752': '전쟁',
  '37': '서부'
};

const MvdetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const userId = sessionStorage.getItem('userId'); 

  useEffect(() => {
    Papa.parse(moviesCSV, {
      download: true,
      header: true,
      complete: (result) => {
        const foundMovie = result.data.find(movie => parseInt(movie.movie_id, 10) === parseInt(id, 10));
        if (foundMovie) {
          console.log("Before Mapping:", foundMovie.genre);
          foundMovie.genre = foundMovie.genre.split(',').map(genreId => genreMapping[genreId.trim()] || genreId.trim()).join(', ');
          console.log("After Mapping:", foundMovie.genre);
          setMovie(foundMovie);
        }
        setLoading(false);
      },
    });
  }, [id]);

  const handleStarClick = async (index) => {
    const newRating = index + 1;
    setRating(newRating);

    const ratingData = {
      user_id: userId,
      movie_id: movie.movie_id,
      rating: parseFloat(newRating)
    };

    try {
      const response = await fetch('http://43.203.39.119:8080/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });

      const responseData = await response.text(); 
      try {
        const jsonResponse = JSON.parse(responseData);
        if (response.ok) {
          setMessage('Rating submitted successfully!');
        } else {
          console.error('Rating submission failed:', jsonResponse);
          setMessage('Failed to submit rating: ' + (jsonResponse.message || 'Unknown error'));
        }
      } catch (e) {
        console.error('JSON parsing error:', responseData);
        setMessage('Failed to submit rating: Invalid JSON response.');
      }

    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to submit rating.');
    }

    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  const handleAddClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveModal = (option) => {
    console.log("저장 옵션:", option);
    setShowModal(false);
  };

  const goToMyPage = () => {
    navigate('/my/watched');
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center' }}>Loading...</div>;
  }

  if (!movie) {
    return <div style={{ color: 'white', textAlign: 'center' }}>Movie not found</div>;
  }

  const validFlatrate = typeof movie.flatrate === 'string' ? movie.flatrate.split(', ').map(service => service.trim().toLowerCase()).filter(Boolean) : [];

  const posterUrl = movie.poster_path ? `http://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/154x231?text=No+Image';

  return (
    <div className="movie-detail-page">
      <header>
        <Link to="/" className="detail-logo">
          <img src={detailLogoImage} alt="Logo" />
        </Link>
        <div className="header-left">
          <button className="mypage-button" onClick={goToMyPage}>마이페이지</button>
          <input type="text" className="search-bar" placeholder="검색어를 입력하세요" />
        </div>
      </header>
      <div className="movie-info-container">
        <div className="left-column">
          <h1 className="detail-movie-title">{movie.title}</h1>
          <div className="detail-rating-and-add">
            <div className="movie-rating">
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  className={`star ${rating > index ? 'filled' : ''}`}
                  onClick={() => handleStarClick(index)}
                >
                  ★
                </span>
              ))}
            </div>
            <button onClick={handleAddClick} className="detail-add-button">+</button>
          </div>
          <p className="movie-details">개봉일 : {movie.release_date}</p>
          <p className="movie-details">장르: {movie.genre}</p>
          <p className="movie-details">국가: {movie.production_countries}</p>
          <p className="movie-runtime">상영시간: {movie.run_time}분</p>
          <p className="movie-cast">출연진: {movie.cast}</p>
        </div>
        <div className="right-column">
          <img src={posterUrl} alt={movie.title} className="movie-poster" />
        </div>
      </div>
      <hr className="custom-hr" />
      <div className="movie-description">
        <h2 className='overview'>개요</h2>
        <p className='fulloverview'>{movie.overview}</p>
      </div>
      <hr className="custom-hr" />
      <div className="ott-buttons-container">
        <h2 className="ott-title">바로가기</h2>
        {validFlatrate.map((platform, index) => (
          <button
            key={index}
            className="ott-button"
            onClick={() => window.open(flatrateUrls[platform], '_blank')}
          >
            <img src={flatrateLogos[platform]} alt={platform} className="ott-logo" />
            <span>{flatrateNames[platform]}</span> {/* 플랫폼 이름을 한글로 변환 */}
          </button>
        ))}
      </div>
      {showModal && <Popcho onClose={handleCloseModal} onSave={handleSaveModal} />}
      {message && <div className="popupContainer">
        <div className="popupContent">
          <p>{message}</p>
          <button onClick={() => setMessage('')}>닫기</button>
        </div>
      </div>}
    </div>
  );
};

export default MvdetailPage;
