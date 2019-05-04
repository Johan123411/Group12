import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class MovieList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: undefined,
            loading: false,
        };
    }
    async getShows() {
        try {
            // const response = await axios.get('http://api.tvmaze.com/shows');
            const response2 = await axios.get('http://localhost:3001/video/list');
            console.log(response2);
            this.setState({ data: response2.data});
        } catch (e) {
            console.log(e);
        }
    }
    componentDidMount() {
        this.getShows();
    }

    handleChange = (e) => {
        let value = e.target.value;
        this.setState({ searchTerm: value }, () => {
            this.searchShows();
        });
    }

    onSubmit(e) {
        e.preventDefault();
    }
    async searchShows(){
        if (this.state.searchTerm) {
            try {
                const response = await axios.get('http://localhost:3001/video/list' + this.state.searchTerm);
                this.setState({searchData: response.data});
            } catch (e) {
                console.log(e);
            }
        }
    }
    render() {
        let body = null;
        let li = null;

        let a = this.state.data;
        let a1 = a;
        var resList = [];
        for (var x in a1) {
            resList.push(this.state.data[x])
        }

        console.log(this.state.data)

        body = (
            <div>
                <ul>
                    {resList.map((value, index) => {
                        return (
                            <a key={index} href={`/movies/${value}`}>
                                <h3>{value}</h3>
                                <br/>
                            </a>
                        )
                    })}
                </ul>
            </div>
        )


        // if (this.state.searchTerm) {
        //     li =
        //         this.state.searchData &&
        //         this.state.searchData.map(shows => {
        //             let show = shows.show;
        //
        //             return (
        //                 <li key={show.id}>
        //                     <Link to={`/shows/${show.id}`}>{show.name}</Link>
        //                 </li>
        //             );
        //         });
        // } else {
        //     li =
        //         this.state.data &&
        //         this.state.data.map(show => (
        //             <li key={show.id}>
        //                 <Link to={`/shows/${show.id}`}>{show.name}</Link>
        //             </li>
        //         ));
        // }



        return body;
    }
}

export default MovieList;
