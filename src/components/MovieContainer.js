import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import MovieList from './MovieList';
//import Show from './Show';

class MovieContainer extends Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route path="/movies" exact component={MovieList} />
                    {/*<Route path="/shows/:id" exact component={Show} />*/}
                </Switch>
            </div>
        );
    }
}

export default MovieContainer;
