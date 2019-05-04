import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class ShowList extends Component {
   constructor(props) {
      super(props);
      this.state = {
         data: undefined,
          data2: undefined,
         loading: false,
         searchTerm: undefined,
         searchData: undefined
      };
   }
      async getShows() {
            try {
                  // const response = await axios.get('http://api.tvmaze.com/shows');
                const response2 = await axios.get('http://localhost:3001/video/list');
                console.log(response2);
                this.setState({ data: response2});
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
      if (this.state.searchTerm) {
         li =
            this.state.searchData &&
            this.state.searchData.map(shows => {
               let show = shows.show;

               return (
                  <li key={show.id}>
                     <Link to={`/shows/${show.id}`}>{show.name}</Link>
                  </li>
               );
            });
      } else {
         li =
            this.state.data &&
            this.state.data.map(show => (
               <li key={show.id}>
                  <Link to={`/shows/${show.id}`}>{show.name}</Link>
               </li>
            ));
      }
      body = (
         <div>
            <form method="POST " name="formName" onSubmit={this.onSubmit}>
               <label>
                  {' '}
                  Search Term:
                  <input
                     type="text"
                     name="searchTerm"
                     onChange={this.handleChange}
                  />
               </label>
            </form>
            <ul className="list-unstyled">{li}</ul>
         </div>
      );

      return body;
   }
}

export default ShowList;
