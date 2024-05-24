
# Authorization

1. Apply auth check for these actions where:
        user is logged in AND is_admin = true
- create company
- update company
- delete company
-


company routes right now are testing if user is logged in, not admin

update the company MODEL, not route
- add an auth check onto the CUD methods

is_admin info is ON THE TOKEN
- check res.locals

res.locals =
    { user: {
            username,
            isAdmin
        }
    }


TODO:
1 - add tests for middleware -- DONE
- if user is not admin and attempts to CUD
    - unauthorized error
- if user is admin and attempts to CUD -- DONE
    - successful (200)
    - all via res.locals?

2 - add new middleware that checks if user is admin based on res.locals obj
Middleware auth check Req:
- checks if user is admin (T/F)
- if F, errors
- if T, calls next()

3 - add tests for checking middleware on the company routes
- if user is not admin and attempts to CUD (3 tests)
- if user is admin and attempts to CUD (3 tests)

4 - add middleware admin check to routes for CUD methods


USERS
START HERE -- TODO:
routes go in order
- if CUD - check if self user first
- if not self user, then check admin


1. check if req.params (:username) is = to res.locals.user.username
2.






# MODELS

## company -- handle = primary key
- create
- find all
- get (by company handle)
- update (by company handle)
- remove (by company handle)

## user
- authenticate
- register
- find all
- get (by username)
- update (by username)
- remove (by username)


# DB Relationship

1 company : Many jobs
    1 company : Many applications


1 job : Many applications
1 user : Many applications


