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

let SearchResults = ({queryText, hits}) => {
    if (hits && hits.body && hits.body.hits.total) {
        return (
            <div className="card">
                <div className="card-header">
                    Total {hits.body.hits.total} hits.
                </div>
                <ul className="list-group list-group-flush">

                    {hits.body.hits.hits.map((hit, i) => {
                        let title = hit.highlight.title
                        title = title ? title[0].trim() : hit._id

                        return <li className="list-group-item" key={hit._id}>
                            <h4 className="card-title" dangerouslySetInnerHTML={{
                                __html: title
                            }} />
                            <ul>
                                {hit.highlight.text.map((text, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{
                                        __html: text.trim()
                                    }} />
                                ))}
                            </ul>
                        </li>
                    })
                    }
                </ul>
            </div>
        )
    } else {
        return null
    }
}
SearchResults = connect(
    store => ({
        queryText: store.frontend.queryText.current,
        hits: store.hits,
    })
)(SearchResults)

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
