import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGames } from '../../redux/actions/gameActions';
import { purchaseGame } from '../../redux/actions/authAction';
import GameCard from './GameCard';
import Loader from '../Loader/Loader';
import './Home.css';
import { FaSearch, FaSort, FaTrashAlt } from 'react-icons/fa';

const Home = () => {
  const dispatch = useDispatch();
  const { games, isLoading } = useSelector((state) => state.game);
  const { purchasedGames } = useSelector((state) => state.auth);

  const [sortOption, setSortOption] = useState('title');
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const gamesPerPage = 10;

  useEffect(() => {
    dispatch(fetchGames());
  }, [dispatch]);

  const handlePurchase = (gameName) => {
    dispatch(purchaseGame(gameName));
  };

  const handleFavorite = (gameName) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(gameName)
        ? prevFavorites.filter((fav) => fav !== gameName)
        : [...prevFavorites, gameName]
    );
  };

  const sortGames = (games, option) => {
    return games.slice().sort((a, b) => {
      switch (option) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'participants':
          return b.participants - a.participants;
        case 'entryFee':
          return a.entryFee - b.entryFee;
        case 'prizeMoney':
          return b.prizeMoney - a.prizeMoney;
        default:
          return 0;
      }
    });
  };

  const filterGames = (games, text) => {
    const lowercasedText = text.toLowerCase();
    return games.filter(
      (game) =>
        (game.title && game.title.toLowerCase().includes(lowercasedText)) ||
        (game.description && game.description.toLowerCase().includes(lowercasedText))
    );
  };

  const handleClearFilters = () => {
    setFilterText('');
    setSortOption('title');
  };

  const sortedGames = sortGames(games, sortOption);
  const filteredGames = filterGames(sortedGames, filterText);

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);

  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="home-container">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header className="home-header">
            <h1>Welcome to the Esports Platform</h1>
            <p>Compete with other gamers and win money!</p>
          </header>
          <section className="filters-section">
            <div className="filter-group">
              <FaSearch className="icon" />
              <input
                type="text"
                placeholder="Search games..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <FaSort className="icon" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="sort-select"
              >
                <option value="title">Title</option>
                <option value="participants">Participants</option>
                <option value="entryFee">Entry Fee</option>
                <option value="prizeMoney">Prize Money</option>
              </select>
            </div>
            <button onClick={handleClearFilters} className="clear-filters-btn">
              <FaTrashAlt className="icon" />
              Clear Filters
            </button>
          </section>
          <section className="featured-games">
            <h2>Featured Games:</h2>
            <div className="game-list">
              {sortedGames.slice(0, 3).map((game) => (
                <GameCard
                  key={game.id}
                  id={game.id}
                  title={game.title}
                  description={game.description}
                  gameName={game.gameName}
                  participants={game.participants}
                  entryFee={parseFloat(game.entryFee) || 0}
                  prizeMoney={parseFloat(game.prizeMoney) || 0}
                  onPurchase={handlePurchase}
                  onFavorite={handleFavorite}
                  isFavorite={favorites.includes(game.gameName)}
                  isPurchased={purchasedGames.includes(game.gameName)}
                  imageUrl={game.imageUrl}
                />
              ))}
            </div>
          </section>
          <section className="all-games">
            <h2>All Games:</h2>
            <div className="game-list">
              {currentGames.length ? (
                currentGames.map((game) => (
                  <GameCard
                    key={game.id}
                    id={game.id}
                    title={game.title}
                    description={game.description}
                    gameName={game.gameName}
                    participants={game.participants}
                    entryFee={parseFloat(game.entryFee) || 0}
                    prizeMoney={parseFloat(game.prizeMoney) || 0}
                    onPurchase={handlePurchase}
                    onFavorite={handleFavorite}
                    isFavorite={favorites.includes(game.gameName)}
                    isPurchased={purchasedGames.includes(game.gameName)}
                    imageUrl={game.imageUrl}
                  />
                ))
              ) : (
                <p>No games found.</p>
              )}
            </div>
          </section>
          <section className="pagination-section">
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={currentPage === index + 1 ? 'active' : ''}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
