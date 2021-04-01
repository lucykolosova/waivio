import {map} from "lodash";
import React from "react";
import PropTypes from "prop-types";
import ReduxInfiniteScroll from "../../vendor/ReduxInfiniteScroll";
import Loading from "../../components/Icon/Loading";
import PaymentCard from "../PaymentCard/PaymentCard";

const PaymentList = props => (
  <ReduxInfiniteScroll
    elementIsScrollable={false}
    hasMore={props.debtObjsData.hasMore}
    loader={<Loading />}
    loadMore={props.handleLoadingMore}
    loadingMore={false}
  >
    {map(props.renderData, debtObjData => {
      const name = debtObjData.userName || debtObjData.guideName;
      return (
        <PaymentCard
          key={name}
          paymentInfo={debtObjData}
          path={`${props.componentLocation}/@${name}`}
        />
      );
    })}
  </ReduxInfiniteScroll>
)

PaymentList.propTypes = {
  debtObjsData: PropTypes.shape().isRequired,
  renderData: PropTypes.arrayOf().isRequired,
  componentLocation: PropTypes.string.isRequired,
  handleLoadingMore: PropTypes.func.isRequired,
};

export default PaymentList;
