import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {combineReducers, createStore, applyMiddleware} from 'redux'
import logger from 'redux-logger'
import {createBrowserHistory, routerReducer, routerMiddleware, startListener} from 'redux-first-routing'
import thunkMiddleware from 'redux-thunk'
import {bindShortcuts} from 'redux-shortcuts'

import * as storage from 'redux-storage'
import createEngine from 'redux-storage-engine-localstorage'

import elasticsearch from 'elasticsearch'

import {hashUpdated, submitQuery, selectNext, selectPrevious} from './actions'
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
        queryInputFocused: false
    }
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
        store.dispatch(hashUpdated(currentHash))
        store.dispatch(submitQuery())
    }
})

if (currentHash) {
    store.dispatch(hashUpdated(currentHash))
    store.dispatch(submitQuery())
}

bindShortcuts(
    [['n', 'j', 'down'], selectNext],
    [['p', 'k', 'up'], selectPrevious],
)(store.dispatch)


let currentActiveHit
function scrollToActiveHit() {
    const previous = currentActiveHit
    const current = store.getState().frontend.active_hit

    if (previous !== current) {
        const element = document.getElementById(`hit-${current}`)
        if (element) {
            element.scrollIntoView(true)
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
