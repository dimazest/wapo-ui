import {CHANGE_QUERY, RENDER_NEW_QUERY, HASH_UPDATED, HITS_RECEIVED} from '../actions'


const frontend = (state = {}, action) => {
    switch (action.type) {
    case CHANGE_QUERY:
        return {
            ...state,
            queryText: {
                ...state.queryText,
                new: action.text
            }
        }
    case RENDER_NEW_QUERY:
        return {
            ...state,
            queryText: {
                ...state.queryText,
                current: state.queryText.new
            }
        }
    case HASH_UPDATED:
        return {
            ...state,
            queryText: {
                ...state.queryText,
                current: action.query,
                new: action.query,
            }
        }
    default:
        return state
    }
}

const hits = (state = {}, action) => {
    switch(action.type) {
    case HITS_RECEIVED:
        return {
            ...state, ...action
        }
    default:
        return state
    }
}

export default {frontend, hits}

