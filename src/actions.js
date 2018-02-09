import {push} from 'redux-first-routing'
import decodeUriComponent from 'decode-uri-component'

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

        dispatch(push({hash: query}))
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
        query = decodeUriComponent(hash).slice(1)
    }

    return {
        type: HASH_UPDATED,
        hash, query
    }
}
