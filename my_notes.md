Code Review Q's:
- _testCommon is setting up the test DB with what is needed before each test is run and cleaning up the
DB after each test finishes
    - don't have to write this by hand for each test bc it is the same setup for all tests

-

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
