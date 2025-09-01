import React, { useState } from "react";
import {
    Container,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
} from "reactstrap";
import classnames from "classnames";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import VRRPGroupTable from "./VRRPGroupTable";
import VRRPTableStatus from "./VRRPTableStatus";

const VRRPView = () => {
    document.title = "VRRP | Minia";

    const [activeTab, setActiveTab] = useState("1");

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="VRRP" breadcrumbItem="VRRP" />

                {/* Tabs Navigation */}
                <Nav tabs className="mb-3">
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === "1" })}
                            onClick={() => toggleTab("1")}
                            style={{ cursor: "pointer" }}
                        >
                            VRRP Group
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === "2" })}
                            onClick={() => toggleTab("2")}
                            style={{ cursor: "pointer" }}
                        >
                            VRRP Status
                        </NavLink>
                    </NavItem>
                </Nav>

                {/* Tab Content */}
                <TabContent activeTab={activeTab}>
                    {/* VRRP Group Tab */}
                    <TabPane tabId="1">
                        <VRRPGroupTable />
                    </TabPane>

                    {/* VRRP Status Tab */}
                    <TabPane tabId="2">
                        <VRRPTableStatus />
                    </TabPane>
                </TabContent>
            </Container>
        </div>
    );
};

export default VRRPView;
