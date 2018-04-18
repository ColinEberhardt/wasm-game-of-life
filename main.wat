(module
  (func $offsetFromCoordinate (param $x i32) (param $y i32) (result i32)
    (i32.add
      (i32.mul 
        (get_local $y)
        (i32.const 50)
      )
      (get_local $x)
    )
  )
  (export "offsetFromCoordinate" (func $offsetFromCoordinate))
)