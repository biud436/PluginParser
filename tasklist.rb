
list = `chcp 65001 | tasklist`.ecode!("UTF-8")
p list.lines