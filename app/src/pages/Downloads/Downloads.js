import React from 'react'

import AppPage from '../../components/AppPage/AppPage'
import DropdownMenu from '../../components/DropdownMenu/DropdownMenu'
import CheckBox from '../../components/CheckBox/CheckBox'



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
                <div className="searchBar">SearchBar</div>
                <span className="info">Infos</span>
                <DropdownMenu
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
                            return { ...s, order };
                        })
                    }
                />
            </div>

            <div className="downloadsList">
                {/* Render all download items here */}
            </div>

            <div className="toolBar"></div>
        </AppPage>
    );
}

export default Downloads
