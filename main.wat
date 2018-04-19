(module
  (memory (export "memory") 1)
  (func $offsetFromCoordinate (param $x i32) (param $y i32) (result i32)
    get_local $y
    i32.const 200
    i32.mul
    get_local $x
    i32.const 4
    i32.mul
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
    (if (result i32)
      (block (result i32)
        get_local $x
        i32.const 0
        i32.lt_s
      )
      (then
        i32.const 0
      )
      (else
        get_local $x
        get_local $y
        call $offsetFromCoordinate
        i32.load8_u
      )
    )    
  )
  (func $liveNeighbourCount (param $x i32) (param $y i32) (result i32)
    i32.const 0

    ;; add the cell value from x + 1, y
    get_local $x
    i32.const 1
    i32.add
    get_local $y
    call $getCell
    i32.add

    ;; add the cell value from x - 1, y
    get_local $x
    i32.const -1
    i32.add
    get_local $y
    call $getCell
    i32.add

    ;; add the cell value from x, y - 1
    get_local $x
    get_local $y
    i32.const -1
    i32.add
    call $getCell
    i32.add

    ;; add the cell value from x - 1, y - 1
    get_local $x
    i32.const -1
    i32.add
    get_local $y
    i32.const -1
    i32.add
    call $getCell
    i32.add

    ;; add the cell value from x + 1, y - 1
    get_local $x
    i32.const 1
    i32.add
    get_local $y
    i32.const -1
    i32.add
    call $getCell
    i32.add

    ;; add the cell value from x, y + 1
    get_local $x
    get_local $y
    i32.const 1
    i32.add
    call $getCell
    i32.add

    ;; add the cell value from x - 1, y + 1
    get_local $x
    i32.const -1
    i32.add
    get_local $y
    i32.const 1
    i32.add
    call $getCell
    i32.add

    ;; add the cell value from x + 1, y + 1
    get_local $x
    i32.const 1
    i32.add
    get_local $y
    i32.const 1
    i32.add
    call $getCell
    i32.add
  )
  (export "offsetFromCoordinate" (func $offsetFromCoordinate))
  (export "liveNeighbourCount" (func $liveNeighbourCount))
  (export "getCell" (func $getCell))
  (export "setCell" (func $setCell))
)