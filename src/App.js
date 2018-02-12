import React from 'react'
import { connect } from 'react-redux'
import Waypoint from 'react-waypoint';

import 'bootstrap/dist/css/bootstrap.css'
import './App.css'

import {submitQuery, changeQuery, increaseHitsCount} from './actions'


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

let SearchResults = ({queryText, hits, onWaypointEnter}) => {
    if (hits && hits.body && hits.body.hits.total) {
        return (
            <div className="card">
                <div className="card-header">
                    Total {hits.body.hits.total} hits.
                </div>
                <ul className="list-group list-group-flush">

                    {hits.body.hits.hits.map((hit, i) => {
                         let h = hit.highlight || {text: []}
                         const s = hit._source
                         const title = h.title ? h.title[0].trim() : s.title
                         const date = new Date(s.date)

                         return (
                             <li className={"list-group-item" + (i % 2 ? " bg-light" : "")} key={hit._id}>
                                 <a href={s.url} className="card-title h4" dangerouslySetInnerHTML={{__html: title}} />
                                 <p className="font-weight-light">
                                     <time dateTime={date} className="text-danger">{date.getMonth()}/{date.getDay()}/{date.getFullYear()}</time>. <a href={`#author:"${s.author}"`}>{s.author}</a> <a href={`#kicker:"${s.kicker}"`} className="badge badge-light">{s.kicker}</a>
                                 </p>
                                 {(h.text && h.text.length) ?
                                  <ul>
                                      {h.text.map((text, i) => (
                                          <li key={i} dangerouslySetInnerHTML={{
                                              __html: text.trim()
                                          }} />
                                      ))}
                                  </ul>
                                  :
                                  <p style={{overflow: "auto", maxHeight: "12em", lineHeight: "1.2em"}}>
                                      {s.text}
                                  </p>
                                 }
                             </li>
                         )
                    })
                    }
                </ul>
                <Waypoint onEnter={onWaypointEnter} />
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
    }),
    dispatch => ({
        onWaypointEnter: () => {
            dispatch(increaseHitsCount())
            dispatch(submitQuery())
        }
    })
)(SearchResults)

const App = () => {
    return (
        <div>
            <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
                <span className="navbar-brand">TREC News</span>
                <QueryForm />
            </nav>
            <main role="main" className="container">
                <SearchResults />
            </main>
        </div>
    )
}

export default App;
