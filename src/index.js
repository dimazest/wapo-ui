import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {combineReducers, createStore, applyMiddleware} from 'redux'
import logger from 'redux-logger'
import {createBrowserHistory, routerReducer, routerMiddleware, startListener} from 'redux-first-routing'
import thunkMiddleware from 'redux-thunk'
import {bindShortcuts, mousetrap, Mousetrap} from 'redux-shortcuts'

import * as storage from 'redux-storage'
import createEngine from 'redux-storage-engine-localstorage'

import elasticsearch from 'elasticsearch'

import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

import * as actions from './actions'
import reducers from './reducers'
import App from './App'

window.client = new elasticsearch.Client({
    host: 'localhost:9200',
})

const history = createBrowserHistory()

const rootReducer = storage.reducer(combineReducers({
    ...reducers,
    router: routerReducer
}))

const storageEngine = createEngine('trec-news-wapo');
const storageMiddleware = storage.createMiddleware(storageEngine)
const createStoreWithMiddleware = applyMiddleware(storageMiddleware)(createStore)

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
    relevance: {}
}
const store = createStoreWithMiddleware(
    rootReducer,
    initialState,
    applyMiddleware(
        logger,
        routerMiddleware(history),
        thunkMiddleware,
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
                const j = ((state.relevance[user] || {})[query] || {})[hit._id]
                return actions.relevanceClick(user, query, hit._id, !j)
            }
        },
        true,
    ],
    [
        ['esc'],
        () => {
            const searchInput = document.getElementById("searchInput")

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
