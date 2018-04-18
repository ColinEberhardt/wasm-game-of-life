(module
  (memory 1)
  (func $offsetFromCoordinate (param $x i32) (param $y i32) (result i32)
    get_local $y
    i32.const 50
    i32.mul
    get_local $x
    i32.add
  )
  (func $setCell (param $x i32) (param $y i32) (param $value i32)
    get_local $x
    get_local $y
    call $offsetFromCoordinate
    get_local $value
    i32.store 
  )
  (func $getCell (param $x i32) (param $y i32) (result i32)
    get_local $x
    get_local $y
    call $offsetFromCoordinate
    i32.load
  )
  (export "offsetFromCoordinate" (func $offsetFromCoordinate))
  (export "getCell" (func $getCell))
  (export "setCell" (func $setCell))
)