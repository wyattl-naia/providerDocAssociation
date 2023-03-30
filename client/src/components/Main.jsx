/***
 * GHU-309
 */
import React, { Component } from "react";
import Select from "react-select";
import * as _ from "lodash";
import { Button, message } from "antd";
import axios from "axios";

class AssociateScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      s3Image: [],
      employee: "",
      docType: "",
      expirationDate: "",
      s3Key: "",
      s3DocId: "",
      employeeNameItems: [],
      employeeIdMap: {},
      isLoading: true,
    };

    this.dockTypeItems = [
      {
        key: "1",
        label: "Government ID",
        value: "governemnt-id",
      },
      {
        key: "2",
        label: "License / Registration / Certificate Renewal Data",
        value: "license-reg-cert",
      },
      {
        key: "3",
        label: "Education / Training",
        value: "education-training",
      },
      {
        key: "4",
        label: "NPDB",
        value: "npdb",
      },
      {
        key: "5",
        label: "DEA",
        value: "dea",
      },
      {
        key: "6",
        label: "BCLS / ACLS",
        value: "blcs-acls",
      },
      {
        key: "7",
        label: "Fitness for Duty",
        value: "fitness-for-duty",
      },
      {
        key: "8",
        label: "TB",
        value: "tb",
      },
      {
        key: "9",
        label: "Immunizations / Exposure Classification",
        value: "immune-expoclass",
      },
      {
        key: "10",
        label: "Privilege List",
        value: "privilege-list",
      },
      {
        key: "11",
        label: "BLS",
        value: "bls",
      },
      {
        key: "12",
        label: "Clinical Copentence/Skills",
        value: "clinical-comp",
      },
      {
        key: "13",
        label: "Other",
        value: "other",
      },
    ];
  }

  async componentDidMount() {
    this.refreshDocument();

    try {
      axios
        .get(
          "https://goshenmedical.naiacorp.net/api/Account/GetAllEmployeesLite"
        )
        .then((res) => {
          this.handleEmployeeList(res.data, this);
        });
    } catch (error) {
      console.log("!!! GetAllEmployeesLite error", error);
    }
  }

  refreshDocument() {
    try {
      axios
        .get("http://localhost:8000/api/s3-provider-docs/one-to-associate")
        .then((res) => {
          this.setState({ s3DocId: res.data._id });
          this.handleS3Doc(res.data.s3_key);
        });
    } catch (error) {
      console.log(error.response.data);
    }
  }

  handleS3Doc = async (tempS3Key) => {
    this.setState({ s3Key: tempS3Key });
    const config = {
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyTmFtZSI6InRsZWUiLCJqdGkiOiI1OGI3YzFmNS1jMGIzLTQ1NzYtYWFkNC1hY2FiYTI2MDU5MGUiLCJpc3MiOiJOYWlhQ29ycCIsImF1ZCI6Ikdvc2hlbiBNZWRpY2FsIn0.NAxqEB0maK2Fh2Ch5xyc3r6L-PGEJo4XivKti3k6o8E",
      },
    };
    const body = {
      file_path: tempS3Key.substring(1),
      s3_bucket: "goshen-provider-documents",
      base64: "true",
    };
    try {
      axios
        .get(
          `https://30f13p2g7e.execute-api.us-east-1.amazonaws.com/dev/patient/document_download?file_path=${body.file_path}&s3_bucket=${body.s3_bucket}&base64=${body.base64}`,
          config,
          {},
          true,
          true
        )
        .then((res) => {
          this.setState({ s3Image: `data:application/pdf;base64,${res.data}` });
        });
    } catch (error) {
      console.log(error.response.data);
    }
  };

  handleEmployeeList = (data, self) => {
    let employeeIdMap = {};
    let employeeNameItems = [];
    let count = 0;

    _.forEach(data, function (x) {
      count++;
      const middleName = x["MiddleName"] ? x["MiddleName"].charAt(0) : "";
      const temp = x["FirstName"] + " " + middleName + " " + x["LastName"];
      if (!employeeNameItems.some((e) => e.label === temp)) {
        employeeIdMap[temp] = x["ContactId"];
        employeeNameItems.push({
          label: temp,
          value: temp,
        });

        if (count === data.length) {
          self.setState({
            employeeNameItems: employeeNameItems,
            employeeIdMap: employeeIdMap,
            isLoading: false,
          });
        }
      }
    });
  };

  loggit = () => {
    console.log(this.state.employeeNameItems);
  };

  render() {
    const createProviderDoc = async (e) => {
      console.log("!!! state", this.state);
      if (!this.state.expirationDate) {
        message.error("Expiration Date is required");
        return;
      }
      if (!this.state.employee) {
        message.error("Employee is required");
        return;
      }
      if (!this.state.docType) {
        message.error("Document Type is required");
        return;
      }

      e.preventDefault();
      const newProviderDoc = {
        employee_id: this.state.employeeIdMap[this.state.employee],
        document_type: this.state.docType,
        s3_key: this.state.s3Key,
        expiry_date: this.state.expirationDate,
      };

      try {
        await axios.post(
          `http://localhost:8000/api/provider-docs`,
          newProviderDoc,
          {},
          true,
          true
        );
        await axios.put(
          `http://localhost:8000/api/s3-provider-docs/${this.state.s3DocId}`,
          { associated: true },
          {},
          true,
          true
        );

        message.success("Successful!");
        this.setState({ docType: "", expiry_date: null });
      } catch (err) {
        message.error(`Error: ${err}`);
      }
    };

    return (
      <div className="associate-screen-wrapper">
        <div className="form">
          Employee Name:
          <Select
            onChange={(emp, e) => {
              this.setState({ employee: emp.value });
            }}
            placeholder="Select a Employee Name"
            options={this.state.employeeNameItems}
            isLoading={this.state.isLoading}
          />{" "}
          <br />
          Document Type:
          <Select
            onChange={(value, e) => {
              this.setState({ docType: value });
            }}
            placeholder="Select a Document Type"
            options={this.dockTypeItems}
          />
          <br />
          Expiration Date:{" "}
          <input
            type="date"
            onChange={(e) => this.setState({ expirationDate: e.target.value })}
            value={this.state.expirationDate}
          />{" "}
          <br />
          <Button onClick={createProviderDoc}>Save</Button>
        </div>
        <div className="pdf">
          <Button onClick={this.refreshDocument}>Next</Button>{" "}
          {this.state.s3Key}
          <embed
            src={this.state.s3Image}
            type="application/pdf"
            height="800px"
          />
        </div>
      </div>
    );
  }
}

export default AssociateScreen;
