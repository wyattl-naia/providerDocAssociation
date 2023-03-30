/***
 * GHU-309
 */
import React, { Component } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import { Input } from "reactstrap";
import axios from "axios";

class AssociateScreenLogin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      member: "",
      memberName: "",
      memberOptions: [],
    };
  }

  async componentDidMount() {
    this.refreshTeamMemberList();
  }

  async refreshTeamMemberList() {
    try {
      axios.get("http://localhost:8000/api/data-team").then((res) => {
        const memberOptions = res.data.map((member) => {
          return { value: member._id, label: member.member_name };
        });

        this.setState({ memberOptions: memberOptions });
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
        .post("http://localhost:8000/api/data-team", newMember)
        .then((res) => {
          this.refreshTeamMemberList();
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
          onChange={(value, e) => {
            this.setState({ member: value });
          }}
          options={this.state.memberOptions}
          value={this.state.member}
        />
        <Link to={"/main"} state={{ member: this.state.member }}>
          <button>Login</button>
        </Link>
      </div>
    );
  }
}

export default AssociateScreenLogin;
