
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


