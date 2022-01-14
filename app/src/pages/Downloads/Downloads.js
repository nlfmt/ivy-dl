import React, { useState, useEffect } from 'react'

import "./downloads.less"

import AppPage from '../../components/AppPage/AppPage'
import DropdownMenu from '../../components/DropdownMenu/DropdownMenu'
import CheckBox from '../../components/ToggleButton/ToggleButton'
import Download from './Download/Download'

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


import downloadData from  "./download.sample.json";

const { dlMgr } = electron;


function Downloads() {

    const [downloads, setDownloads] = useState([
        downloadData, downloadData
    ]);

    const [sort, setSort] = useState({
        type: 0,
        order: 0, // 0 - desc, 1 - asc
    });

    
    useEffect( async () => {

        // Initial Download loading
        let dlData = await dlMgr.loadDownloads();
        setDownloads(dlData);

        // get new downloads
        const cb = (dl) => {
            console.log("new download", dl);
            return;
            setDownloads(dls => {
                dls.push(dl);
                return dls;
            });
        }
        dlMgr.onNewDownload(cb);

        return () => {
            dlMgr.offNewDownload(cb);
        }
    }, []);

    // re-sort the downloads
    useEffect(() => {
        console.log("re-sort");
    }, [downloads, sort])


    return (
        <AppPage name="downloads">
            <div className="searchBar">
                <div className="search">
                    <SearchRounded className="searchIcon" />
                    <input type="text" placeholder="Search" />
                </div>
                <span className="info">{downloads.length} Videos</span>
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
                {downloads.map((dl, i) => {
                    return (
                        <Download key={i} url={dl.url} info={dl} />
                    );
                })}
            </div>

            <div className="toolBar"></div>
        </AppPage>
    );
}

export default Downloads
