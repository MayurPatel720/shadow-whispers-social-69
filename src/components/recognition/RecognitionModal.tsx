/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getRecognitions, revokeRecognition } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { User, Recognition } from "@/types/user";
import AvatarGenerator from "@/components/user/AvatarGenerator";
import { Loader2, X } from "lucide-react";
import RecognitionStatsBox from "./RecognitionStatsBox";
import RecognitionUserList from "./RecognitionUserList";

interface RecognitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RecognitionModal = ({ open, onOpenChange }: RecognitionModalProps) => {
  const [activeTab, setActiveTab] = useState("recognized");
  const [filter, setFilter] = useState("all");

  const {
    data: recognitionData,
    isLoading,
    refetch,
  } = useQuery<Recognition>({
    queryKey: ["recognitions", activeTab, filter],
    queryFn: () => getRecognitions(activeTab, filter),
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  // Fallbacks for stats
  const totalRecognized = recognitionData?.stats?.totalRecognized ?? 0;
  const totalRecognizers = recognitionData?.stats?.totalRecognizers ?? 0;
  const recognitionRate = recognitionData?.stats?.recognitionRate ?? 0;
  const successfulRecognitions = recognitionData?.stats?.successfulRecognitions ?? 0;
  const recognitionAttempts = recognitionData?.stats?.recognitionAttempts ?? 0;

  const handleRevokeRecognition = async (userId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to revoke this recognition? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await revokeRecognition(userId);
      toast({
        title: "Recognition revoked",
        description: "The recognition has been successfully revoked.",
      });
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to revoke recognition",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recognition Summary</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <RecognitionStatsBox
              totalRecognized={totalRecognized}
              totalRecognizers={totalRecognizers}
              recognitionRate={recognitionRate}
              successfulRecognitions={successfulRecognitions}
              recognitionAttempts={recognitionAttempts}
            />

            <div className="flex justify-end mb-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="mutual">Mutual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs
              defaultValue="recognized"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="recognized">I've Recognized</TabsTrigger>
                <TabsTrigger value="recognizers">Recognized Me</TabsTrigger>
              </TabsList>
              <TabsContent value="recognized">
                <RecognitionUserList
                  users={(recognitionData?.recognized ?? []) as User[]}
                  activeTab="recognized"
                  onRevoke={handleRevokeRecognition}
                />
              </TabsContent>
              <TabsContent value="recognizers">
                <RecognitionUserList
                  users={(recognitionData?.recognizers ?? []) as User[]}
                  activeTab="recognizers"
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecognitionModal;
