(module
  (import "console" "log" (func $log (param i32) (param i32)))

  (memory $mem 1)

  (table 16 anyfunc)
  (elem (i32.const 0)
    ;; for cells that are currently dead
    $dead
    $dead
    $dead
    $alive
    $dead
    $dead
    $dead
    $dead
    ;; for cells that are currently alive
    $dead
    $dead
    $alive
    $alive
    $dead
    $dead
    $dead
    $dead
  )

  (func $alive (result i32)
    i32.const 1
  )

  (func $dead (result i32)
    i32.const 0
  )


  (func $offsetFromCoordinate (param $x i32) (param $y i32) (result i32)
    (i32.add
      (i32.mul
        (i32.const 200)
        (get_local $y))
      (i32.mul
        (i32.const 4)
        (get_local $x))
    )
  )

  (func $setCell (param $x i32) (param $y i32) (param $value i32)
    (i32.store
      (call $offsetFromCoordinate
        (get_local $x)
        (get_local $y)
      )
      (get_local $value)
    )
  )

  (func $getCell (param $x i32) (param $y i32) (result i32)
    (if (result i32)
      (block (result i32)
        (i32.and
          (call $inRange
            (i32.const 0)
            (i32.const 50)
            (get_local $x)
          )
          (call $inRange
            (i32.const 0)
            (i32.const 50)
            (get_local $y)
          )
        )
      )
      (then
        (i32.load8_u
          (call $offsetFromCoordinate
            (get_local $x)
            (get_local $y))
        )
      )
      (else
        (i32.const 0)
      )
    )    
  )

  (func $liveNeighbourCount (param $x i32) (param $y i32) (result i32)
    i32.const 0

    ;; add the cell value from x + 1, y
    (call $isCellAlive
      (i32.add
        (get_local $x)
        (i32.const 1)
      )    
      (get_local $y)
    )
    i32.add

    ;; add the cell value from x - 1, y
    (call $isCellAlive
      (i32.add
        (get_local $x)
        (i32.const -1)
      )    
      (get_local $y)
    )
    i32.add

    ;; add the cell value from x, y - 1
    (call $isCellAlive
      (get_local $x)
      (i32.add
        (get_local $y)
        (i32.const -1)
      )
    )
    i32.add

    ;; add the cell value from x - 1, y - 1
    (call $isCellAlive
      (i32.add
        (get_local $x)
        (i32.const -1)
      ) 
      (i32.add
        (get_local $y)
        (i32.const -1)
      )
    )
    i32.add

    ;; add the cell value from x + 1, y - 1
    (call $isCellAlive
      (i32.add
        (get_local $x)
        (i32.const 1)
      ) 
      (i32.add
        (get_local $y)
        (i32.const -1)
      )
    )
    i32.add

    ;; add the cell value from x, y + 1
    (call $isCellAlive
      (get_local $x)
      (i32.add
        (get_local $y)
        (i32.const 1)
      )
    )
    i32.add

    ;; add the cell value from x - 1, y + 1
    (call $isCellAlive
      (i32.add
        (get_local $x)
        (i32.const -1)
      ) 
      (i32.add
        (get_local $y)
        (i32.const 1)
      )
    )
    i32.add

    ;; add the cell value from x + 1, y + 1
    (call $isCellAlive
      (i32.add
        (get_local $x)
        (i32.const 1)
      ) 
      (i32.add
        (get_local $y)
        (i32.const 1)
      )
    )
    i32.add
  )

  (func $inRange (param $low i32) (param $high i32) (param $value i32) (result i32)
    (i32.and
      (i32.ge_s (get_local $value) (get_local $low))
      (i32.lt_s (get_local $value) (get_local $high))
    )  
  )

  (func $isCellAlive (param $x i32) (param $y i32) (result i32)
    (i32.and
      (call $getCell
        (get_local $x)
        (get_local $y)
      )
      (i32.const 1)
    )
  )

  (func $setCellStateForNextGeneration (param $x i32) (param $y i32) (param $value i32)
    (call $setCell
      (get_local $x)
      (get_local $y)
      (i32.or
        (call $isCellAlive
          (get_local $x)
          (get_local $y)
        )
        (i32.shl
          (get_local $value)
          (i32.const 1)
        )
      )
    )
  )

  (func $evolveCellToNextGeneration (param $x i32) (param $y i32)
    (call $setCellStateForNextGeneration
      (get_local $x)
      (get_local $y)
      (call_indirect (result i32)
        (i32.or
          (i32.mul
            (i32.const 8)
            (call $isCellAlive
              (get_local $x)
              (get_local $y)
            )
          )
          (call $liveNeighbourCount
            (get_local $x)
            (get_local $y)
          )
        )
      )
    )
  )

  (func $increment (param $value i32) (result i32)
    (i32.add 
      (get_local $value)
      (i32.const 1)
    )
  )

  (func $evolveAllCells
    (local $x i32)
    (local $y i32)

    (set_local $y (i32.const 0))
    
    (block 
      (loop 

        (set_local $x (i32.const 0))

        (block 
          (loop 
            ;; (call $log
            ;;   (get_local $x)
            ;;   (get_local $y)
            ;; )
            (call $evolveCellToNextGeneration
              (get_local $x)
              (get_local $y)
            )
            (set_local $x (call $increment (get_local $x)))
            (br_if 1 (i32.eq (get_local $x) (i32.const 50)))
            (br 0)
          )
        )
        
        (set_local $y (call $increment (get_local $y)))
        (br_if 1 (i32.eq (get_local $y) (i32.const 50)))
        (br 0)
      )
    )
  )

  (func $promoteNextGeneration
    (local $x i32)
    (local $y i32)

    (set_local $y (i32.const 0))
    
    (block 
      (loop 

        (set_local $x (i32.const 0))

        (block 
          (loop
            (call $setCell
              (get_local $x)
              (get_local $y)
              (i32.shr_u
                (call $getCell
                  (get_local $x)
                  (get_local $y)
                )
                (i32.const 1)
              )
            )

            (set_local $x (call $increment (get_local $x)))
            (br_if 1 (i32.eq (get_local $x) (i32.const 50)))
            (br 0)
          )
        )
        
        (set_local $y (call $increment (get_local $y)))
        (br_if 1 (i32.eq (get_local $y) (i32.const 50)))
        (br 0)
      )
    )
  )

  (func $tick
    (call $evolveAllCells)
    (call $promoteNextGeneration)
  )

  (export "tick" (func $tick))
  (export "promoteNextGeneration" (func $promoteNextGeneration))
  (export "evolveAllCells" (func $evolveAllCells))
  (export "evolveCellToNextGeneration" (func $evolveCellToNextGeneration))
  (export "setCellStateForNextGeneration" (func $setCellStateForNextGeneration))
  (export "isCellAlive" (func $isCellAlive))
  (export "inRange" (func $inRange))
  (export "offsetFromCoordinate" (func $offsetFromCoordinate))
  (export "liveNeighbourCount" (func $liveNeighbourCount))
  (export "getCell" (func $getCell))
  (export "setCell" (func $setCell))
  (export "memory" (memory $mem))
)