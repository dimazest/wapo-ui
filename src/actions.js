import {batchActions} from 'redux-batched-actions';
import {push} from 'redux-first-routing'

export const RENDER_NEW_QUERY = 'RENDER_NEW_QUERY'
export const renderNewQuery = () => {
    return {
        type: RENDER_NEW_QUERY
    }
}


export const submitQuery = () => {
    return (dispatch, getState) => {
        dispatch(renderNewQuery())

        const query = getState().frontend.queryText.current

        dispatch(push(`/#${query}`))
    }
}


export const CHANGE_QUERY = 'CHANGE_QUERY'
export const changeQuery = text => {
    return {
        type: CHANGE_QUERY,
        text
    }
}


export const HASH_UPDATED = 'HASH_UPDATED'
export const hashUpdated = hash => {
    let query = ''
    if (hash) {
        query = hash.slice(1)
    }

    return {
        type: HASH_UPDATED,
        hash, query
    }
}
