// Called every frame
void UData::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    FVector OwnerLocation = Owner->GetActorLocation();
    FRotator OwnerRotation = Owner->GetActorRotation().Clamp();

    int arrOffSet = OwnerRotation.Yaw;
    directionalArr = &memory[arrOffSet];

    if(lastHit > 0) lastHit -= DeltaTime;

    if (energy > 0) {
        energy -= DeltaTime;
        if (energy <= 0) ProcessHit(attr_health);
    }

    UpdateHealth();


    // Raycast parameters
    FCollisionQueryParams TraceParams;
    TraceParams.AddIgnoredActor(Owner);
    FHitResult HitResult;


    for (int32 i = 0; i < directionalArrSize; i++) {
        // this is used to know the direction of the raycast relative to the owner
        FVector Direction = OwnerRotation.RotateVector(std::get<1>(directionTuple[i]));

        TArray<FHitResult> Hits;

        // Perform the raycast
        if (GetWorld()->LineTraceMultiByObjectType(Hits, OwnerLocation, OwnerLocation + Direction * 1000.0f, PawnsAndCorpses, TraceParams))
        {
            int sumOfHits = 0;
            for (auto Hit : Hits) {
                if (Hit.GetActor()->GetName().Mid(0, 12) == "BP_Character") {
                    if (!IDMap.Contains(Hit.GetActor()->FindComponentByClass<UData>()->ID)) {
                        IDMap.Add(Hit.GetActor()->FindComponentByClass<UData>()->ID, CalcAttraction(Hit.GetActor()));

                    }

                    if (!(Hit.GetActor()->FindComponentByClass<UData>()->IDMap.Contains(ID))) {
						Hit.GetActor()->FindComponentByClass<UData>()->IDMap.Add(ID, CalcAttraction(Owner));

					}
                }


                sumOfHits += gameObjectToAffinity(Hit.GetActor());

            }

            memory[(arrOffSet + i) % 360] = sumOfHits;

            // update highest if necessary
            if (sumOfHits > highestHit) {
				highestHit = sumOfHits;
				highestHitI = (arrOffSet + i) % 360;
			}

            // Get Play_UI 
            if(seeDebugLines)DrawDebugLine(GetWorld(), OwnerLocation, OwnerLocation + Direction * 1000.0f, FColor::Red, false, 0.1f, 0, 1.0f);

        } else {
            if (seeDebugLines)DrawDebugLine(GetWorld(), OwnerLocation, OwnerLocation + Direction * 1000.0f, FColor::Green, false, 0.1f, 0, 1.0f);
            
        }
    }

    DecayMemory();

}