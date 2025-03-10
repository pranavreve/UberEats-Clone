import React, { Component } from 'react';
import axios from 'axios';
import { Card, Row, Col, Empty, message } from 'antd';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import './Favorites.css';

class Favorites extends Component {
  state = {
    favorites: [],
    loading: true,
  };

  componentDidMount() {
    this.fetchFavorites();
  }

  fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/customer/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.setState({ favorites: response.data, loading: false });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      message.error('Failed to load favorites');
      this.setState({ loading: false });
    }
  };

  toggleFavorite = async (restaurantId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/customer/favorites/toggle', 
        { restaurantId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      this.fetchFavorites(); // Refresh the favorites list
    } catch (error) {
      console.error('Error toggling favorite:', error);
      message.error('Failed to update favorite');
    }
  };

  render() {
    const { favorites, loading } = this.state;

    if (loading) {
      return <div className="favorites-loading">Loading...</div>;
    }

    if (favorites.length === 0) {
      return (
        <div className="favorites-empty">
          <Empty
            description="No favorite restaurants yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }

    return (
      <div className="favorites-container">
        <h1>My Favorite Restaurants</h1>
        <Row gutter={[16, 16]}>
          {favorites.map(restaurant => (
            <Col xs={24} sm={12} md={8} lg={6} key={restaurant._id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={restaurant.name}
                    src={restaurant.image || 'https://via.placeholder.com/300x200'}
                  />
                }
                actions={[
                  <HeartFilled
                    key="favorite"
                    className="favorite-icon active"
                    onClick={() => this.toggleFavorite(restaurant._id)}
                  />
                ]}
              >
                <Card.Meta
                  title={restaurant.name}
                  description={restaurant.cuisine}
                />
                <div className="restaurant-details">
                  <p>{restaurant.address}</p>
                  <p>Rating: {restaurant.rating}/5</p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }
}

export default Favorites; 