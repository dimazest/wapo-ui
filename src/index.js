import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {combineReducers, createStore, applyMiddleware} from 'redux'
import logger from 'redux-logger'
import {createBrowserHistory, routerReducer, routerMiddleware, startListener} from 'redux-first-routing'
import thunkMiddleware from 'redux-thunk'
import {bindShortcuts, mousetrap, Mousetrap} from 'redux-shortcuts'
import { reducer as notifReducer } from 'redux-notifications'

import * as storage from 'redux-storage'
import createEngine from 'redux-storage-engine-localstorage'
import filter from 'redux-storage-decorator-filter'

import elasticsearch from 'elasticsearch'

import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

import * as actions from './actions'
import reducers from './reducers'
import App from './App'

window.client = new elasticsearch.Client({
    host: 'localhost:9200',
})
window.api_root = 'http://localhost:3300'

const history = createBrowserHistory()

const rootReducer = storage.reducer(combineReducers({
    ...reducers,
    router: routerReducer,
    notifs: notifReducer,
}))

const storageEngine = filter(
    createEngine('trec-news-wapo'),
    ['frontend'],
);
const storageMiddleware = storage.createMiddleware(storageEngine)

const initialState = {
    frontend: {
        queryText: {current: '', new: ''},
        from: 0,
        size: 10,
        active_hit: 0,
        queryInputFocused: false,
        user: null,
        showTopicForm: false,
    },
    relevance: {},
    topic: {},
    topics: {},
}
const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(
        thunkMiddleware,
        storageMiddleware,
        routerMiddleware(history),
        logger,
    )
)

const load = storage.createLoader(storageEngine)
load(store)

startListener(history, store)

let currentHash = store.getState().router.hash
store.subscribe(() => {
    const previousHash = currentHash
    currentHash = store.getState().router.hash

    if (previousHash !== currentHash) {
        store.dispatch(actions.hashUpdated(currentHash))
        store.dispatch(actions.submitQuery())
    }
})

if (currentHash) {
    store.dispatch(actions.hashUpdated(currentHash))
    store.dispatch(actions.submitQuery())
}

fetch(`${window.api_root}/topic`)
.then(r => r.json())
.then(d => store.dispatch(actions.topicsReceived(d)))

fetch(`${window.api_root}/relevance`)
.then(r => r.json())
.then(d => store.dispatch(actions.loadJudgments(d)))

bindShortcuts(
    [['n', 'j', 'down'], actions.selectNext],
    [['p', 'k', 'up'], actions.selectPrevious],
    [
        ['space'],
        () => {
            const state = store.getState()

            const user = state.frontend.user
            const query = state.frontend.queryText.current
            const activeHit = state.frontend.active_hit

            if (!user) {return {type: ""}}

            const hits = (state.hits.body || {hits: {hits: []}}).hits.hits
            const hit = hits[activeHit]
            if (hit !== undefined) {
                const j = (state.relevance[query] || {})[hit._id]
                return actions.relevanceClick(user, query, hit._id, j > 0 ? 0 : 1)
            }
        },
        true,
    ],
    [
        ['esc'],
        () => {
            const searchInput = document.getElementById("searchInput")

            if (!searchInput) {return {type: ""}}

            if (searchInput === document.activeElement) {
                searchInput.blur()
            } else {
                searchInput.focus({preventScroll: false})
            }

            return {type: ""}
        },
        true
    ],
)(store.dispatch)

mousetrap.stopCallback = (e, element, combo, sequence) => {
    const searchInput = document.getElementById("searchInput")

    if ((element === searchInput) & (combo === 'esc')) {
        return false
    }

    return Mousetrap.stopCallback(e, element, combo, sequence)
}


let currentActiveHit
function scrollToActiveHit() {
    const previous = currentActiveHit
    const current = store.getState().frontend.active_hit

    if (previous !== current) {
        const element = document.getElementById(`hit-${current}`)
        if (element) {
            scrollIntoViewIfNeeded(element)
            currentActiveHit = current
        }
    }
}
store.subscribe(scrollToActiveHit)

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
)
