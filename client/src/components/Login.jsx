/***
 * GHU-309
 */
import React, { Component } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import { Input } from "reactstrap";
import axios from "axios";
import { Button, message } from "antd";

class AssociateScreenLogin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      member: "",
      memberName: "",
      memberOptions: [],
      memberList: []
    };
  }

  async componentDidMount() {
    this.refreshTeamMemberList();
  }

  async refreshTeamMemberList() {
    try {
      axios.get(`${process.env.REACT_APP_API_URL}/api/data-team`).then((res) => {
        const memberOptions = res.data.map((member) => {
          return { value: member._id, label: member.member_name };
        });

        this.setState({ memberOptions: memberOptions, memberList: res.data });
      });
    } catch (error) {
      console.log(error);
    }
  }

  handleSubmit = async (e) => {
    const newMember = {
      member_name: this.state.memberName,
    };
    try {
      axios
        .post(`${process.env.REACT_APP_API_URL}/api/data-team`, newMember)
        .then((res) => {
          this.refreshTeamMemberList();
        });
    } catch (error) {
      console.log("!!! handleSubmit error", error);
    }
  };

  login = async (e) => {
    const member = this.state.memberList.find(member =>  member._id === this.state.member)
    if(!member) {
      return;
    }
    try {
      axios.put(`${process.env.REACT_APP_API_URL}/api/data-team/${member._id}`, {number_of_docs_associated: member.number_of_docs_associated+1})
        .then((res) => {
          window.location.href = "/main"
        }, err => {
          message.error(err.message)
        });
    } catch (error) {
      console.log("!!! handleSubmit error", error);
    }
  };

  render() {
    return (
      <div>
        <Input
          onChange={(e) => this.setState({ memberName: e.target.value })}
        ></Input>
        <button onClick={this.handleSubmit}>Add Data Team Member</button>
        <Select
          onChange={(member, e) => {
            this.setState({ member: member.value });
          }}
          options={this.state.memberOptions}
        />
        <Button onClick={this.login} >Login</Button>
      </div>
    );
  }
}

export default AssociateScreenLogin;
