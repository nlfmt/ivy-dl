import React, { useState } from 'react'

import "./downloads.less"

import AppPage from '../../components/AppPage/AppPage'
import DropdownMenu from '../../components/DropdownMenu/DropdownMenu'
import CheckBox from '../../components/ToggleButton/ToggleButton'

import { ArrowDownwardRounded, SearchRounded } from '@material-ui/icons'



const sortOptions = {
    0: "Date",
    1: "Size",
    2: "Length",
    3: "Views",
    4: "Likes",
    5: "Dislikes",
    6: "Comments",
}


function Downloads() {

    const [sort, setSort] = useState({
        type: 0,
        order: 0, // 0 - desc, 1 - asc
    });

    return (
        <AppPage name="downloads">
            <div className="searchBar">
                <div className="search">
                    <SearchRounded className="searchIcon" />
                    <input type="text" placeholder="Search" />
                </div>
                <span className="info">14 Videos</span>
                <div className="sortOptions">
                    <DropdownMenu
                        label="Sort by"
                        default={0}
                        onChange={(type) =>
                            setSort((s) => {
                                return { ...s, type };
                            })
                        }
                        options={sortOptions}
                    />
                    <CheckBox
                        onChange={(order) =>
                            setSort((s) => {
                                return { ...s, order: order ? 1 : 0 };
                            })
                        }
                    >
                        <ArrowDownwardRounded />
                    </CheckBox>
                </div>
            </div>

            <div className="downloadsList">
                {/* Render all download items here */}
            </div>

            <div className="toolBar"></div>
        </AppPage>
    );
}

export default Downloads
