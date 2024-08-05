import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTournaments } from '../../redux/actions/tournamentActions'; 
import { purchaseTournament } from '../../redux/actions/authAction'; 
import TournamentCard from './TournamentCard';
import Loader from '../Loader/Loader';
import './Home.css';
import { FaSearch, FaSort, FaTrashAlt } from 'react-icons/fa';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { formatToRupees } from '../../utils/currencyFormatter'; // Import the currency formatter

const Home = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.tournament); 
  const { purchasedTournaments = [] } = useSelector((state) => state.auth) || {}; 

  const [sortOption, setSortOption] = useState('title');
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [realTimeTournaments, setRealTimeTournaments] = useState([]);
  const tournamentsPerPage = 10;

  useEffect(() => {
    const tournamentsCollection = collection(firestore, 'tournaments');
    const unsubscribe = onSnapshot(tournamentsCollection, (snapshot) => {
      const tournamentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setRealTimeTournaments(tournamentsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    dispatch(fetchTournaments());
  }, [dispatch]);

  const handlePurchase = (tournamentName) => {
    dispatch(purchaseTournament(tournamentName)); 
  };

  const handleFavorite = (tournamentName) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(tournamentName)
        ? prevFavorites.filter((fav) => fav !== tournamentName)
        : [...prevFavorites, tournamentName]
    );
  };

  const sortTournaments = (tournaments, option) => {
    return tournaments.slice().sort((a, b) => {
      switch (option) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'participants':
          return (b.participants || 0) - (a.participants || 0);
        case 'entryFee':
          return (a.entryFee || 0) - (b.entryFee || 0);
        case 'prizeMoney':
          return (b.prizeMoney || 0) - (a.prizeMoney || 0);
        default:
          return 0;
      }
    });
  };

  const filterTournaments = (tournaments, text) => {
    const lowercasedText = text.toLowerCase();
    return tournaments.filter(
      (tournament) =>
        (tournament.title && tournament.title.toLowerCase().includes(lowercasedText)) ||
        (tournament.description && tournament.description.toLowerCase().includes(lowercasedText))
    );
  };

  const handleClearFilters = () => {
    setFilterText('');
    setSortOption('title');
  };

  const sortedTournaments = sortTournaments(realTimeTournaments || [], sortOption);
  const filteredTournaments = filterTournaments(sortedTournaments || [], filterText);

  // Pagination logic
  const indexOfLastTournament = currentPage * tournamentsPerPage;
  const indexOfFirstTournament = indexOfLastTournament - tournamentsPerPage;
  const currentTournaments = filteredTournaments.slice(indexOfFirstTournament, indexOfLastTournament);
  const totalPages = Math.ceil(filteredTournaments.length / tournamentsPerPage);

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
                placeholder="Search tournaments..."
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
          <section className="featured-tournaments">
            <h2>Featured Tournaments:</h2>
            <div className="tournament-list">
              {sortedTournaments.slice(0, 3).map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  id={tournament.id}
                  title={tournament.title}
                  description={tournament.description}
                  tournamentName={tournament.tournamentName}
                  participants={tournament.participants}
                  entryFee={formatToRupees(parseFloat(tournament.entryFee) || 0)} // Format entryFee
                  prizeMoney={formatToRupees(parseFloat(tournament.prizeMoney) || 0)} // Format prizeMoney
                  onPurchase={handlePurchase}
                  onFavorite={handleFavorite}
                  isFavorite={favorites.includes(tournament.tournamentName || '')}
                  isPurchased={purchasedTournaments.includes(tournament.tournamentName || '')}
                  imageUrl={tournament.imageUrl}
                />
              ))}
            </div>
          </section>
          <section className="all-tournaments">
            <h2>All Tournaments:</h2>
            <div className="tournament-list">
              {currentTournaments.length ? (
                currentTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    id={tournament.id}
                    title={tournament.title}
                    description={tournament.description}
                    tournamentName={tournament.tournamentName}
                    participants={tournament.participants}
                    entryFee={formatToRupees(parseFloat(tournament.entryFee) || 0)} // Format entryFee
                    prizeMoney={formatToRupees(parseFloat(tournament.prizeMoney) || 0)} // Format prizeMoney
                    onPurchase={handlePurchase}
                    onFavorite={handleFavorite}
                    isFavorite={favorites.includes(tournament.tournamentName || '')}
                    isPurchased={purchasedTournaments.includes(tournament.tournamentName || '')}
                    imageUrl={tournament.imageUrl}
                  />
                ))
              ) : (
                <p>No tournaments found.</p>
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
