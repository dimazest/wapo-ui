import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {combineReducers, createStore, applyMiddleware} from 'redux'
import logger from 'redux-logger'
import {createBrowserHistory, routerReducer, routerMiddleware, startListener} from 'redux-first-routing'
import thunkMiddleware from 'redux-thunk'
import {bindShortcuts} from 'redux-shortcuts'

import elasticsearch from 'elasticsearch'

import {hashUpdated, submitQuery, selectNext, selectPrevious} from './actions'
import reducers from './reducers'
import App from './App'

window.client = new elasticsearch.Client({
    host: 'localhost:9200',
})

const history = createBrowserHistory()

const rootReducer = combineReducers({
    ...reducers,
    router: routerReducer
})

const initialState = {
    frontend: {
        queryText: {current: '', new: ''},
        from: 0,
        size: 10,
        active_hit: 0,
    }
}
const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(
        logger,
        routerMiddleware(history),
        thunkMiddleware,
    )
)

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

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
)
