import React from 'react'

const { shell } = electron;

import "./link.less"

const Link = (props) => {
  return (
    <a {...props} onClick={e => {
        console.log("redirecting to ext browser")
        e.preventDefault();
        shell.openExternal(props.href);
    }}>{props.children}</a>
  )
}

export default Link