import React from "react";
import styled from "@emotion/styled";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { green } from "@mui/material/colors";

import {
  Badge,
  Box,
  Grid as Grid,
  Card,
  TextField as MuiTextField,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Fab,
  Breadcrumbs as MuiBreadcrumbs,
  Divider as MuiDivider,
  Link,
} from "@mui/material";
import { spacing } from "@mui/system";
import SendIcon from "@mui/icons-material/Send";

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);

const Divider = styled(MuiDivider)(spacing);

const TextField = styled(MuiTextField)(spacing);

const ChatContainer = styled(Grid)`
  width: 100%;
  height: 65vh;
`;

const ChatSidebar = styled(Grid)`
  border-right: 1px solid ${(props) => props.theme.palette.divider};
`;

const ChatMain = styled(Grid)``;

const ChatMessages = styled.div`
  overflow-y: scroll;
  height: calc(65vh - 94px);
`;

const ChatMessage = styled.div`
  margin: 30px;
  text-align: ${(props) => props.position};
`;

const ChatMessageInner = styled.div`
  display: inline-block;
`;

const ChatMessageTime = styled(Typography)`
  text-align: right;
  opacity: 0.8;
`;

const ChatMessageAvatar = styled(Avatar)`
  position: relative;
  display: inline-block;
  width: 34px;
  height: 34px;
  margin-right: ${(props) => props.theme.spacing(2)};
`;

const ChatMessageBubble = styled.div`
  display: inline-block;
  margin-right: auto;
  background: ${(props) =>
    props.highlighted
      ? props.theme.palette.secondary.main
      : props.theme.palette.action.hover};
  color: ${(props) =>
    props.highlighted
      ? props.theme.palette.common.white
      : props.theme.palette.text.primary};
  border-radius: 3px;
  padding: ${(props) => props.theme.spacing(2)};
  margin-bottom: ${(props) => props.theme.spacing(1)};
  ${(props) => props.theme.shadows[1]};
`;

const ChatMessageBubbleName = styled(Typography)`
  font-weight: ${(props) => props.theme.typography.fontWeightBold};
`;

const ChatInput = styled(Grid)`
  min-height: 94px;
  padding: ${(props) => props.theme.spacing(5)};
`;

const Online = styled(Badge)`
  margin-right: ${(props) => props.theme.spacing(1)};
  span {
    background-color: ${() => green[400]};
    border: 1.5px solid ${(props) => props.theme.palette.common.white};
    height: 12px;
    width: 12px;
    border-radius: 50%;
  }
`;

function ChatMessageComponent({
  name,
  message,
  time,
  avatar,
  position = "left",
}) {
  return (
    <ChatMessage position={position}>
      <ChatMessageInner>
        <ChatMessageAvatar alt="Lucy Lavender" src={avatar} />
        <ChatMessageBubble highlighted={position === "right"}>
          <Box>
            <ChatMessageBubbleName variant="body1">
              {name}
            </ChatMessageBubbleName>
          </Box>
          <Typography variant="body2">{message}</Typography>
        </ChatMessageBubble>
        <ChatMessageTime variant="body2">{time}</ChatMessageTime>
      </ChatMessageInner>
    </ChatMessage>
  );
}

function ChatWindow() {
  return (
    <ChatContainer container component={Card}>
      <ChatSidebar size={{ xs: 12, md: 4, lg: 3 }}>
        <Grid size={12}>
          <Box p={2}>
            <TextField label="Search contacts" variant="outlined" fullWidth />
          </Box>
        </Grid>
        <Divider />
        <List>
          <ListItemButton>
            <ListItemIcon>
              <Online
                overlap="circular"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                variant="dot"
              >
                <Avatar
                  alt="Lucy Lavender"
                  src="/static/img/avatars/avatar-1.jpg"
                />
              </Online>
            </ListItemIcon>
            <ListItemText primary="Lucy Lavender" secondary="Sent a photo" />
          </ListItemButton>
          <ListItemButton>
            <ListItemIcon>
              <Online
                overlap="circular"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                variant="dot"
              >
                <Avatar
                  alt="Remy Sharp"
                  src="/static/img/avatars/avatar-2.jpg"
                />
              </Online>
            </ListItemIcon>
            <ListItemText primary="Remy Sharp" secondary="Coffee?" />
          </ListItemButton>
          <ListItemButton>
            <ListItemIcon>
              <Avatar
                alt="Cassandra Mixon"
                src="/static/img/avatars/avatar-3.jpg"
              />
            </ListItemIcon>
            <ListItemText primary="Cassandra Mixon" secondary="Hello! 👋" />
          </ListItemButton>
        </List>
      </ChatSidebar>
      <ChatMain size={{ xs: 12, md: 8, lg: 9 }}>
        <ChatMessages>
          <ChatMessageComponent
            name="Remy Sharp"
            avatar="/static/img/avatars/avatar-2.jpg"
            message="Sit meis deleniti eu, pri vidit meliore docendi ut, an eum erat animal commodo."
            time="20 minutes ago"
            position="left"
          />
          <ChatMessageComponent
            name="You"
            avatar="/static/img/avatars/avatar-1.jpg"
            message="Lorem ipsum dolor sit amet, vis erat denique in, dicunt prodesset te vix."
            time="12 minutes ago"
            position="right"
          />
          <ChatMessageComponent
            name="Remy Sharp"
            avatar="/static/img/avatars/avatar-2.jpg"
            message="Cum ea graeci tractatos. 😄"
            time="8 minutes ago"
            position="left"
          />
          <ChatMessageComponent
            name="You"
            avatar="/static/img/avatars/avatar-1.jpg"
            message="Cras pulvinar, sapien id vehicula aliquet, diam velit elementum orci. 👍"
            time="5 minutes ago"
            position="right"
          />
          <ChatMessageComponent
            name="Remy Sharp"
            avatar="/static/img/avatars/avatar-2.jpg"
            message="Lorem ipsum dolor sit amet, vis erat denique in, dicunt prodesset te vix."
            time="3 minutes ago"
            position="left"
          />
        </ChatMessages>
        <Divider />
        <ChatInput container>
          <Grid style={{ flexGrow: 1 }}>
            <TextField variant="outlined" label="Type your message" fullWidth />
          </Grid>
          <Grid>
            <Box ml={2}>
              <Fab color="primary" aria-label="add" size="medium">
                <SendIcon />
              </Fab>
            </Box>
          </Grid>
        </ChatInput>
      </ChatMain>
    </ChatContainer>
  );
}

function Chat() {
  return (
    <React.Fragment>
      <Helmet title="Chat" />

      <Typography variant="h3" gutterBottom display="inline">
        Chat
      </Typography>

      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NavLink} to="/">
          Dashboard
        </Link>
        <Link component={NavLink} to="/">
          Pages
        </Link>
        <Typography>Chat</Typography>
      </Breadcrumbs>

      <Divider my={6} />

      <ChatWindow />
    </React.Fragment>
  );
}

export default Chat;
