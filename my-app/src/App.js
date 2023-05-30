import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/events/')
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    if (loggedIn) {
      axios.get(`http://localhost:8000/events/?user_id=${localStorage.getItem('user_id')}`)
        .then(response => {
          setUserEvents(response.data);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }, [loggedIn]);

  const handleLogin = () => {
    axios.post('http://localhost:8000/login/', { username, password })
      .then(response => {
        localStorage.setItem('user_id', response.data.user_id);
        setLoggedIn(true);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    setLoggedIn(false);
  };

  const handleLike = (event) => {
    axios.patch(`http://localhost:8000/events/${event.id}/`, { is_liked: !event.is_liked })
      .then(response => {
        if (loggedIn) {
          axios.get(`http://localhost:8000/events/?user_id=${localStorage.getItem('user_id')}`)
            .then(response => {
              setUserEvents(response.data);
            })
            .catch(error => {
              console.log(error);
            });
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleAddEvent = (event) => {
    axios.post('http://localhost:8000/events/', { ...event, user_id: localStorage.getItem('user_id') })
      .then(response => {
        setEvents([...events, response.data]);
        setUserEvents([...userEvents, response.data]);
      })
      .catch(error => {
        console.log(error);
      });
  };

  return (
    <div>
      <div>
        {loggedIn ? (
          <div>
            <span>Welcome, {localStorage.getItem('username')}!</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
          </div>
        )}
      </div>
      <div>
        <button onClick={() => setTab('global')}>Global</button>
        {loggedIn && <button onClick={() => setTab('user-specific')}>User Specific</button>}
      </div>
      {tab === 'global' && (
        <div>
          {events.map(event => (
            <div key={event.id}>
              <img src={event.image} alt={event.event_name} />
              <h2>{event.event_name}</h2>
              <p>{event.date} {event.time}</p>
              <p>{event.location}</p>
              <button onClick={() => handleLike(event)}>{event.is_liked ? '❤️' : '🤍'}</button>
            </div>
          ))}
        </div>
      )}
      {tab === 'user-specific' && (
        <div>
          {userEvents.map(event => (
            <div key={event.id}>
              <img src={event.image} alt={event.event_name} />
              <h2>{event.event_name}</h2>
              <p>{event.date} {event.time}</p>
              <p>{event.location}</p>
              <button onClick={() => handleLike(event)}>{event.is_liked ? '❤️' : '🤍'}</button>
            </div>
          ))}
          <form onSubmit={handleSubmit(handleAddEvent)}>
            <input type="text" placeholder="Event Name" {...register('event_name')} />
            <input type="date" placeholder="Date" {...register('date')} />
            <input type="time" placeholder="Time" {...register('time')} />
            <input type="text" placeholder="Location" {...register('location')} />
            <input type="file" {...register('image')} />
            <button type="submit">Add Event</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
