import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
  UncontrolledTooltip,
} from "reactstrap";
import { FaPlay, FaRedo } from "react-icons/fa";
import { postData } from "../../../../helpers/api"; // adjust path

const Command = ({ _id }) => {
  document.title = "Devices | Minia";

  const [command, setCommand] = useState("date");
  const [textareaValue, setTextareaValue] = useState("date");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCommand = async () => {
    setLoading(true);
    setOutput("");
    try {
      const payload = {
        entity: "agent",
        api: "exec_timeout",
        params: {
          cmd: textareaValue,
          timeout: 60,
        },
      };
      const res = await postData(`devices/${_id}/send`, payload);

      if (res?.message?.output) {
        setOutput(res.message.output);
      } else {
        setOutput("No output received.");
      }
    } catch (err) {
      console.error("Error sending command", err);
      setOutput("Error sending command.");
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownChange = (e) => {
    setCommand(e.target.value);
    setTextareaValue(e.target.value);
  };

  return (
    <React.Fragment>
      <Card>
        <CardHeader>
          <CardTitle className="h4">Send Command</CardTitle>
        </CardHeader>
        <CardBody>
          <Form>
            <FormGroup>
              <Label for="commandDropdown">Message</Label>
              <Input
                type="select"
                id="commandDropdown"
                value={command}
                onChange={handleDropdownChange}
              >
                <option value="date">date</option>
                {/* You can add more commands here */}
              </Input>
              <UncontrolledTooltip target="commandDropdown">
                Select the command to send to the device
              </UncontrolledTooltip>
            </FormGroup>

            <FormGroup>
              <Label for="commandTextarea">Command</Label>
              <Input
                type="textarea"
                id="commandTextarea"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
              />
              <UncontrolledTooltip target="commandTextarea">
                You can edit the command before sending
              </UncontrolledTooltip>
            </FormGroup>

            <div className="d-flex gap-2 mb-3">
              <Button
                color="primary"
                onClick={sendCommand}
                disabled={loading}
                id="btnSend"
              >
                {loading ? <Spinner size="sm" /> : <FaPlay />}
              </Button>
              <UncontrolledTooltip target="btnSend">
                Send the command to the device
              </UncontrolledTooltip>

              <Button
                color="secondary"
                onClick={() => {
                  setTextareaValue(command);
                  setOutput("");
                }}
                id="btnReset"
              >
                <FaRedo />
              </Button>
              <UncontrolledTooltip target="btnReset">
                Reset command and clear output
              </UncontrolledTooltip>
            </div>

            <FormGroup>
              <Label for="outputBox">Output</Label>
              <Input
                type="textarea"
                id="outputBox"
                value={output}
                readOnly
                placeholder="Output will appear here after sending the command"
              />
            </FormGroup>
          </Form>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default Command;
