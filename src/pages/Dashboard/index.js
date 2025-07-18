import React from 'react';

import ReactApexChart from "react-apexcharts"

//import Breadcrumbs
import Breadcrumbs from "../../components/Common/Breadcrumb";

import {
    Card,
    CardBody,
    Col,
    Container,
    Row
} from "reactstrap";



import CountUp from "react-countup";

/** import Mini Widget data */
import { WidgetsData } from "../../common/data/dashboard";
import WalletBalance from './WalletBalance';
import InvestedOverview from './InvestedOverview';
import MarketOverview from './MarketOverview';
import Locations from './Locations';
import Trading from './Trading';
import Transactions from './Transactions';
import RecentActivity from './RecentActivity';
import NewSlider from './NewSlider';

import Leaflet from "leaflet"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"

Leaflet.Icon.Default.imagePath = "../node_modules/leaflet"

delete Leaflet.Icon.Default.prototype._getIconUrl

Leaflet.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
})

const options = {
    chart: {
        height: 50,
        type: "line",
        toolbar: { show: false },
        sparkline: {
            enabled: true
        }
    },
    colors: ["#5156be"],
    stroke: {
        curve: "smooth",
        width: 2,
    },
    xaxis: {
        labels: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
        axisBorder: {
            show: false,
        },
    },
    yaxis: {
        labels: {
            show: false,
        },
    },
    tooltip: {
        fixed: {
            enabled: false,
        },
        x: {
            show: false,
        },
        y: {
            title: {
                formatter: function (seriesName) {
                    return "";
                },
            },
        },
        marker: {
            show: false,
        },
    },
};

const Dashboard = () => {

    //meta title
    document.title = "Dashboard | Minia - React Admin & Dashboard Template";


    const position = {
        lat: 51.505,
        lng: -0.09,
        zoom: 13,
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    {/* Render Breadcrumbs */}
                    <Breadcrumbs title="Dashboard" breadcrumbItem="Dashboard" />
                    <h4 className="card-title">Markers with Custom Icons</h4>
                    <div id="leaflet-map-custom-icons" className="leaflet-map">
                        <MapContainer
                            center={position}
                            zoom={position.zoom}
                            style={{ height: "300px" }}
                        >
                            <TileLayer
                                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={position}>
                                <Popup>
                                    A pretty CSS3 popup. <br /> Easily customizable.
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>

                    {/* <Row>
                       

                    </Row>
                    <Row>
                        <WalletBalance />
                        <Col>
                            <Row>
                                <InvestedOverview />
                                <NewSlider />
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <MarketOverview />
                        <Locations />
                    </Row>
                    <Row>
                        <Trading />
                        <Transactions />
                        <RecentActivity />
                    </Row> */}
                </Container>
            </div>
        </React.Fragment>
    );
}

export default Dashboard;