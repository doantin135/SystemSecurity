import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Button } from 'react-bootstrap';

const Home = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Welcome {user?.email}</h2>
      <Button variant="danger" onClick={handleLogout}>
        Logout
      </Button>
    </Container>
  );
};

export default Home;