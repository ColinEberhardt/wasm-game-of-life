(module
  (func $offsetFromCoordinate (param $x i32) (param $y i32) (result i32)
    get_local $y
    i32.const 50
    i32.mul
    get_local $x
    i32.add
  )
  (export "offsetFromCoordinate" (func $offsetFromCoordinate))
)