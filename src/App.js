import React from 'react'
import { connect } from 'react-redux'
import Waypoint from 'react-waypoint'

import 'bootstrap/dist/css/bootstrap.css'
import './App.css'

import 'open-iconic/font/css/open-iconic-bootstrap.css'
import dateFormat from 'dateformat'

import {submitQuery, changeQuery, increaseHitsCount, linkClick, queryInputFocusChange,
        relevanceClick, setCredentials
} from './actions'


let QueryForm = ({queryText, onChangeQuery, onSubmitQuery,
                  onInputFocus, onInputBlur, queryInputFocused, user, setCredentials}) => ([
                      <div className="mx-auto">
                          <form className="form-inline mt-2 mt-md-0"
                                onSubmit={e => {
                                        e.preventDefault()
                                        onSubmitQuery()
                                }}
                          >
                              <div className="input-group">
                                  <div class="input-group-prepend">
                                      <span
                                          class="input-group-text" id="username-prepend"
                                      >
                                          <span class="oi oi-person mr-1"></span>
                                          <span
                                              onClick={() => setCredentials(null)}
                                              style={{cursor: "default"}}
                                          >
                                              {user}
                                          </span>
                                      </span>
                                  </div>
                                  <input className="form-control" placeholder="Search" aria-label="Search" style={{"width": "600px"}}
                                         id="searchInput"
                                         value={queryText}
                                         type="search"
                                         onChange={e => onChangeQuery(e.target.value)}
                                         onFocus={onInputFocus}
                                         onBlur={onInputBlur}
                                         autoFocus={true}
                                  />
                                  <div className="input-group-append">
                                      <button
                                          className={"btn " +(queryInputFocused ? " btn-primary" : " btn-secondary")}
                                          type="submit"
                                      >
                                          Search
                                      </button>
                                  </div>
                              </div>
                          </form>
                      </div>,
                      <span class="navbar-text">
                          <span style={{visibility: queryInputFocused ? "hidden" : "visible"}}>
                              <kbd>j</kbd>: next item,
                              <kbd>k</kbd>: previous item,
                              <kbd>space</kbd>: toggle relevance,
                          </span>
                      <kbd>esc</kbd>: switch
                          </span>
                      : null
                  ])

QueryForm = connect(
    state => ({
        queryText: state.frontend.queryText.new,
        queryInputFocused: state.frontend.queryInputFocused,
        user: state.frontend.user,
    }),
    dispatch => ({
        onSubmitQuery: () => dispatch(submitQuery(true)),
        onChangeQuery: text => dispatch(changeQuery(text)),
        onInputFocus: () => dispatch(queryInputFocusChange(true)),
        onInputBlur: () => dispatch(queryInputFocusChange(false)),
        setCredentials: (userName) => dispatch(setCredentials(userName)),
    })
)(QueryForm)

let SearchResults = ({queryText, hits, onWaypointEnter, onLinkClick, active_hit, relevance, user, onRelevanceClick}) => {
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

                         const isRelevant = (relevance[user] !== undefined) && (relevance[user][queryText] !== undefined) && relevance[user][queryText][hit._id]
                         const isActiveHit = i === active_hit
                         return (
                             <li
                                 className={"list-group-item" + (i % 2 ? " bg-light" : "")} key={hit._id}
                                 id={`hit-${i}`}
                                 >
                                 <div class="container-fluid">
                                     <div class="row align-items-center">
                                         <div class="col-11 mr-auto pl-0">
                                             <h4>
                                                 <span className={"badge mr-2" + (isActiveHit ? " badge-primary" : " badge-secondary")}>{i+1}</span>
                                                 <a
                                                     href={s.url}
                                                     className={(!isActiveHit ? "text-muted" : "")}
                                                     dangerouslySetInnerHTML={{__html: title}}
                                                     onClick={(e) => onLinkClick(e, i)}
                                                 />
                                             </h4>
                                         </div>
                                         <div class="col-1">
                                             <button
                                                 type="button"
                                                 class={"btn btn-small" + (
                                                         isRelevant
                                                         ? " btn-success"
                                                         : (isActiveHit ? " btn-secondary" : " btn-outline-secondary")
                                                 )}
                                                 onClick={() => onRelevanceClick(user, queryText, hit._id, !isRelevant)}
                                             >
                                                 <span class="oi oi-thumb-up" />
                                             </button>
                                         </div>
                                     </div>
                                 </div>
                                 <p className="font-weight-light">
                                     <time dateTime={date} className="text-secondary mr-1">
                                         {dateFormat(date, "shortDate")}
                                     </time>
                                     <a href={`#author:"${s.author}"`} className="mr-1">{s.author}</a>
                                     <a href={`#kicker:"${s.kicker}"`} className="badge badge-light">{s.kicker}</a>
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
                                  <p style={{overflow: "scroll", maxHeight: "12em", lineHeight: "1.2em"}}>
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
        active_hit: store.frontend.active_hit,
        relevance: store.relevance,
        user: store.frontend.user,
    }),
    dispatch => ({
        onWaypointEnter: () => {
            dispatch(increaseHitsCount())
            dispatch(submitQuery())
        },
        onLinkClick: (e, i) => {e.preventDefault(); dispatch(linkClick(i))},
        onRelevanceClick: (user, query, docID, judgment) => {dispatch(relevanceClick(user, query, docID, judgment))},
    })
)(SearchResults)

const WaPo = ({wapo_url}) => {
    return <iframe
               className="mw-100 mh-100 w-100 h-100 border-0"
               src={wapo_url}
               title="WaPo"
           />
}

let App = ({active_hit, hits, user, onSubmitCredentials, currentQuery, queryInputFocused}) => {
    hits = hits.body ? hits.body.hits.hits : null
    const wapo_url = (hits && active_hit >= 0 && hits[active_hit]) ? hits[active_hit]._source.url : null

    if (!user) {
        let input
        return <div className="jumbotron jumbotron-fluid">
            <div className="container">
                <h1 className="display-4">Please sign in!</h1>
                <p className="lead">
                    You need to provide a unique idenifier, for example your login.
                </p>
                <form
                    onSubmit={() => onSubmitCredentials(input.value)}
                >
                    <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                            <span className="input-group-text">
                                <span className="oi oi-person" /></span>
                        </div>
                        <input
                            type="text" className="form-control" placeholder="Anything that uniquely identifies you..."
                            ref = {i => input = i}
                            autoFocus={true}
                        />
                        <div className="input-group-append">
                            <button
                                className="btn btn-primary" type="submit"
                            >
                                Sign in
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    }

    return [
        <nav className={
            "navbar navbar-expand-md fixed-top"
                      + (queryInputFocused ? " navbar-dark bg-dark" : " navbar-light bg-light")
        }>
            <span className="navbar-brand">WaPo</span>
            <QueryForm />
        </nav>,
        currentQuery ?
        <main role="main" className="containerFluid mx-5" style={{position: 'relative'}}>
            <div className="row">
                <div className="col-6" style={{overflowX: 'hidden', overflowY: 'auto', position: 'fixed', top: '4.5rem', bottom: '0', left: 0}}>
                    <SearchResults />
                </div>
                {wapo_url &&
                 <div className="col-6 offset-6 bg-light" style={{overflowX: 'hidden', overflowY: 'auto', position: 'fixed', top: '4.5rem', bottom: '0', left: 0}}>
                     <WaPo wapo_url={wapo_url} />
                 </div>
                }
            </div>
        </main>
        :
        <div className="jumbotron jumbotron-fluid">
            <div className="container">
                <h1>
                    Search for <a href="#Interesting things">interesting things</a> or anything else.
                </h1>
            </div>
        </div>
    ]
}
App = connect(
    state => ({
        active_hit: state.frontend.active_hit,
        hits: state.hits,
        user: state.frontend.user,
        currentQuery: state.frontend.queryText.current,
        queryInputFocused: state.frontend.queryInputFocused,
    }),
    dispatch => ({
        onSubmitCredentials: userName => dispatch(setCredentials(userName)),
    })
)(App)
export default App;
