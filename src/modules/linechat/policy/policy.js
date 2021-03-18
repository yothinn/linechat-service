"use strict";

/**
 * Module dependencies.
 */
var acl = require("acl");

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Admin Permissions
 */
exports.invokeRolesPolicies = function() {
  acl.allow([
    {
      roles: ["admin", "user"],
      allows: [
        {
          resources: "/api/linechat/login",
          permissions: "*"
        },
        {
          resources: "/api/linechat/chatRoomList",
          permissions: "*"
        },
        {
          resources: "/api/linechat/userList",
          permissions: "*"
        },
        {
          resources: "/api/linechat/historyMessage",
          permissions: "*"
        },
        {
          resources: "/api/linechat/sendMessage",
          permissions: "*"
        },
        {
          resources: "/api/linechat/streamApiToken",
          permissions: "*"
        }
      ]
    }
  ]);
};

/**
 * Check If Admin Policy Allows
 */
exports.isAllowed = function(req, res, next) {
  var roles = req.user ? req.user.roles : ["guest"];

  console.log(roles);
  // Check for user roles
  acl.areAnyRolesAllowed(
    roles,
    req.route.path,
    req.method.toLowerCase(),
    function(err, isAllowed) {
      if (err) {
        // An authorization error occurred.
        return res.status(500).json({
          status: 403,
          message: "Unexpected authorization error"
        });
      } else {
        if (isAllowed) {
          // Access granted! Invoke next middleware
          return next();
        } else {
          return res.status(403).json({
            status: 403,
            message: "User is not authorized"
          });
        }
      }
    }
  );
};
