import React from 'react'
import { connect } from 'react-redux'

import 'bootstrap/dist/css/bootstrap.css'
import './App.css'

import {submitQuery, changeQuery} from './actions'


let QueryForm = ({queryText, onChangeQuery, onSubmitQuery}) => {
    return (
        <div className="mx-auto">
            <form className="form-inline mt-2 mt-md-0"
                  onSubmit={e => {
                          e.preventDefault()

                          onSubmitQuery()
                  }}
            >
                <input className="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search" style={{"width": "600px"}}
                 value={queryText}
                 onChange={e => onChangeQuery(e.target.value)}
                />
                <button className="btn btn-success my-2 my-sm-0" type="submit">Search</button>
            </form>
        </div>
    )
}
QueryForm = connect(
    state => ({queryText: state.frontend.queryText.new}),
    dispatch => ({
        onSubmitQuery: () => dispatch(submitQuery()),
        onChangeQuery: text => dispatch(changeQuery(text))
    })
)(QueryForm)

let SearchResults = ({queryText}) => {
    return (
        <div className="jumbotron">
            <h1>{queryText}</h1>
            <p className="lead">This example is a quick exercise to illustrate how fixed to top navbar works. As you scroll, it will remain fixed to the top of your browser's viewport.</p>
        </div>

    )
}
SearchResults = connect(store => ({queryText: store.frontend.queryText.current}))(SearchResults)

const App = () => {
    return (
        <div>
            <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
                <a className="navbar-brand" href="#">TREC News</a>
                <QueryForm />
            </nav>
            <main role="main" className="container">
                <SearchResults />
            </main>
        </div>
    )
}

export default App;
